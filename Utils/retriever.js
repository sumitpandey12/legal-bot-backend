const {
  SupabaseVectorStore,
} = require("@langchain/community/vectorstores/supabase");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { createClient } = require("@supabase/supabase-js");

const openAIApiKey = process.env.OPENAI_API_KEY;

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL_LC_CHATBOT;
const client = createClient(sbUrl, sbApiKey);

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever();

module.exports = { retriever };
