"use server"

import { nanoid } from "nanoid";
import { openai, pc } from "../utils";

export async function searchCodeAction(query:string, formData?:FormData) {
  try {
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    });
    const index = pc.index("find-code-index")
    const queryResponse = await index.namespace("ns1").query({
      topK: 2,
      vector: queryEmbedding.data[0].embedding,
      includeValues: true,
      includeMetadata:true
    });
    console.log(queryResponse);
    return {matches:queryResponse.matches, success:true}
  } catch (error) {
    console.log(error);
    return {success:false, matches:[]}
  }
}