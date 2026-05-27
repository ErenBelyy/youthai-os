// Azure AI Search wrapper.
import { SearchClient, SearchIndexClient, AzureKeyCredential } from '@azure/search-documents';

export const searchConfigured = () => Boolean(
  process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_API_KEY && process.env.AZURE_SEARCH_INDEX_NAME
);

export function getSearchClient() {
  if (!searchConfigured()) return null;
  return new SearchClient(
    process.env.AZURE_SEARCH_ENDPOINT,
    process.env.AZURE_SEARCH_INDEX_NAME,
    new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY)
  );
}

export function getIndexClient() {
  if (!searchConfigured()) return null;
  return new SearchIndexClient(
    process.env.AZURE_SEARCH_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY)
  );
}
