// Azure OpenAI client using the official `openai` SDK in Azure mode.
import OpenAI from 'openai';

export const azureConfigured = () => Boolean(
  process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_CHAT_DEPLOYMENT
);

let _client = null;
export function getAzureOpenAI() {
  if (!azureConfigured()) return null;
  if (_client) return _client;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, '');
  const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
  _client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${endpoint}/openai/deployments/${deployment}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
  });
  return _client;
}

export async function chatCompletion({ messages, temperature = 0.4, stream = false }) {
  const client = getAzureOpenAI();
  if (!client) throw new Error('AZURE_OPENAI_NOT_CONFIGURED');
  const resp = await client.chat.completions.create({
    model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
    messages, temperature, stream,
  });
  return resp;
}

export async function embed(text) {
  const client = getAzureOpenAI();
  if (!client) throw new Error('AZURE_OPENAI_NOT_CONFIGURED');
  const dep = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-3-large';
  // Use a separate sub-client for the embedding deployment
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, '');
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';
  const sub = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${endpoint}/openai/deployments/${dep}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
  });
  const r = await sub.embeddings.create({ model: dep, input: text });
  return r.data[0].embedding;
}
