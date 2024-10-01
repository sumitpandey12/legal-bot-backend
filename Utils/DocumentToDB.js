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
}) {
  try {
    console.log("Getting text from file");
    const text = (await pdf(filePath)).text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 70,
      separators: ["\n\n", "\n", " ", ""],
    });

    console.log("Splitting text into chunks");
    const output = await splitter.createDocuments([text]);

    console.log("Chunk size: ", output.length);

    const client = createClient(sbUrl, sbApiKey);

    const res = await SupabaseVectorStore.fromDocuments(
      output,
      new OpenAIEmbeddings({ openAIApiKey }),
      {
        client,
        tableName,
      }
    );

    console.log("Uploaded text to Supabase Vector Store");

    return {
      tableName: "documents",
      queryName: "match_documents",
      chunkSize: output.length,
    };
  } catch (err) {
    console.error("Error during upload:", err);
    // Throw the error so it can be handled by the calling function
    throw err;
  }
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
