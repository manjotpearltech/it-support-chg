const fetch = require('node-fetch');

// Helper: deduplicate and keep only citations relevant to the generated content
function filterRelevantCitations(answer, citations) {
  if (!citations || citations.length === 0) return [];

  // Deduplicate by URL (or title if URL missing)
  const seen = new Set();
  const deduped = citations.filter(c => {
    const key = (c.url || '') + '|' + (c.title || '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 1) Prefer citations that match phrases the model emphasized in **bold**
  const boldPhrases = (answer.match(/\*\*(.+?)\*\*/g) || [])
    .map(s => s.slice(2, -2).trim().toLowerCase())
    .filter(s => s.length > 2);
  const boldMatched = deduped.filter(c => {
    const hay = `${c.title} ${c.content}`.toLowerCase();
    return boldPhrases.some(bp => hay.includes(bp));
  });

  if (boldMatched.length > 0) {
    return boldMatched.slice(0, 5);
  }

  // 2) Fall back to simple keyword overlap on meaningful words
  const stop = new Set(['with','that','this','from','have','your','will','then','into','here','copy','click','open','make','sure','also','once','need','next','back','step','steps','phone','apps','team','teams','sent','send','paste','youre','theyre','email','mail','device','devices','connect']);
  const keywords = Array.from(
    new Set(
      (answer.toLowerCase().match(/[a-z0-9]{4,}/g) || [])
        .filter(w => !stop.has(w))
        .slice(0, 25)
    )
  );

  const relevant = deduped.filter(c => {
    const hay = (c.content || '').toLowerCase();
    return keywords.some(k => hay.includes(k));
  });

  // If nothing matched by keywords, keep the original deduped list
  const finalList = (relevant.length > 0 ? relevant : deduped).slice(0, 5);
  return finalList;
}

// Helper: pull original filename from a URL's last path segment (decoded)
function getOriginalFilenameFromUrl(url) {
  try {
    const u = new URL(url);
    const last = (u.pathname.split('/').pop() || '').trim();
    if (!last) return '';
    return decodeURIComponent(last);
  } catch {
    if (!url) return '';
    const noQuery = url.split('?')[0].split('#')[0];
    const last = (noQuery.split('/').pop() || '').trim();
    try { return decodeURIComponent(last); } catch { return last; }
  }
}

class AzureOpenAIService {
  constructor(endpoint, apiKey, deploymentName, apiVersion = '2025-01-01-preview') {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.deploymentName = deploymentName;
    this.apiVersion = apiVersion;
  }

  async generateResponse(messages, searchResults, temperature = 0.2, maxTokens = 700) {
    try {
      // Prepare data sources for grounding with strict enforcement
      const dataSources = [{
        type: 'azure_search',
        parameters: {
          endpoint: process.env.AZURE_SEARCH_ENDPOINT,
          index_name: process.env.AZURE_SEARCH_INDEX,
          authentication: {
            type: 'api_key',
            key: process.env.AZURE_SEARCH_KEY,
          },
          query_type: 'semantic',
          semantic_configuration: 'default',
          fields_mapping: {
            content_fields: ['content'],
            title_field: 'metadata_storage_name',
            url_field: 'metadata_storage_path',
          },
          top_n_documents: 5,
          strictness: 5,
          in_scope: true,
        },
      }];

      // Make the API call
      const response = await fetch(
        `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify({
            messages,
            data_sources: dataSources,
            temperature,
            max_tokens: maxTokens,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract content and citations
      const content = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';
      let citations = [];

      // Extract citations from the context
      const context = data.choices?.[0]?.message?.context;
      if (context?.citations) {
        for (const citation of context.citations) {
          const decodedUrl = this.decodeBase64Url(citation.url || '');
          const originalFileName = getOriginalFilenameFromUrl(decodedUrl);
          citations.push({
            title: originalFileName || citation.title || 'Unknown Document',
            url: decodedUrl,
            content: citation.content || '',
          });
        }
      }

      // Deduplicate and filter citations
      citations = filterRelevantCitations(content, citations);

      return {
        content,
        citations,
      };
    } catch (error) {
      console.error('Azure OpenAI error:', error);
      throw new Error('Failed to generate response');
    }
  }

  decodeBase64Url(encodedUrl) {
    try {
      if (encodedUrl && encodedUrl.length > 0 && !encodedUrl.startsWith('http')) {
        const decoded = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        if (decoded.startsWith('http') || decoded.includes('blob.core.windows.net')) {
          return decoded;
        }
      }
      return encodedUrl;
    } catch {
      return encodedUrl;
    }
  }
}

module.exports = { AzureOpenAIService };

