import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { nanoid } from "nanoid";
import { openai, pc } from "@/lib/utils";

// await pc.createIndex({
//   name: indexName,
//   dimension: 1536,
//   metric: "cosine",
//   spec: {
//     serverless: {
//       cloud: "aws",
//       region: "us-east-1",
//     },
//   },
// });

export async function GET(req: NextRequest) {
  const {query}:{query:string} = await req.json()
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
    return NextResponse.json({matches:queryResponse.matches, success:true})
  } catch (error) {
    console.log(error);
    return NextResponse.json({success:false, matches:[]}, {status:500})
  } 
}
