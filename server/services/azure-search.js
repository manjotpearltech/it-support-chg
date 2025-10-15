const { SearchClient, AzureKeyCredential } = require('@azure/search-documents');

class AzureSearchService {
  constructor(endpoint, indexName, apiKey) {
    this.searchClient = new SearchClient(
      endpoint,
      indexName,
      new AzureKeyCredential(apiKey)
    );
  }

  async search(query, topN = 3) {
    try {
      const searchResults = await this.searchClient.search(query, {
        top: topN,
        queryType: 'semantic',
        semanticSearchOptions: {
          configurationName: 'default',
        },
        select: ['content', 'metadata_storage_name', 'metadata_storage_path'],
        includeTotalCount: true,
      });

      const results = [];
      
      for await (const result of searchResults.results) {
        results.push({
          content: result.document.content || '',
          title: result.document.metadata_storage_name || 'Unknown Document',
          url: this.decodeBase64Url(result.document.metadata_storage_path || ''),
          score: result.score || 0,
        });
      }

      return {
        results,
        totalCount: searchResults.count || 0,
      };
    } catch (error) {
      console.error('Azure Search error:', error);
      throw new Error('Failed to search knowledge base');
    }
  }

  decodeBase64Url(encodedUrl) {
    try {
      return Buffer.from(encodedUrl, 'base64').toString('utf-8');
    } catch {
      return encodedUrl; // Return as-is if decoding fails
    }
  }
}

module.exports = { AzureSearchService };

