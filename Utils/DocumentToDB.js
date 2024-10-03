const pdf = require("pdf-parse");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { createClient } = require("@supabase/supabase-js");
const {
  SupabaseVectorStore,
} = require("@langchain/community/vectorstores/supabase");
const { OpenAIEmbeddings } = require("@langchain/openai");

async function uploadTextToDBVector({
  filePath,
  tableName,
  openAIApiKey,
  sbApiKey,
  sbUrl,
  fileName,
}) {
  try {
    console.log("Getting text from filename: " + fileName);
    const text = (await pdf(filePath)).text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 120,
      separators: ["\n\n", "\n", " "],
    });

    console.log("Splitting text into chunks");
    const output = await splitter.createDocuments([text]);

    const embeddingsList = await createEmbeddingsList({
      chunks: output,
      filename: fileName,
    });
    const client = createClient(sbUrl, sbApiKey);
    const { data, error } = await client
      .from("documents")
      .insert(embeddingsList)
      .select();

    console.log("Uploaded text to Supabase");

    if (error) {
      console.error("Error during upload:", error.message);
      return false;
    }

    return {
      tableName: "documents",
      queryName: "match_documents",
      chunkSize: output.length,
    };
  } catch (err) {
    console.error("Error during upload:", err);
    throw err;
  }
}

async function createEmbeddingsList({ chunks, filename }) {
  const lists = [];
  const model = new OpenAIEmbeddings();
  const chunkContents = chunks.map((chunk) => chunk.pageContent);
  const embeddings = await model.embedDocuments(chunkContents);
  for (let i = 0; i < chunks.length; i++) {
    lists.push({
      content: chunks[i].pageContent,
      metadata: chunks[i].metadata,
      embedding: embeddings[i],
      filename: filename,
    });
  }
  return lists;
}

async function deleteAllRowsFromDB({ tableName, sbApiKey, sbUrl }) {
  try {
    const client = createClient(sbUrl, sbApiKey);

    const { error, data } = await client.from(tableName).delete().gt("id", 0);
    console.log("Rows deleted:", data);

    if (error) {
      console.error("Error during deletion:", error);
      throw new Error("Error deleting rows: " + error.message);
    }
    return data;
  } catch (err) {
    console.error("Error during deletion process:", err);
    throw err;
  }
}

module.exports = {
  uploadTextToDBVector,
  deleteAllRowsFromDB,
};
