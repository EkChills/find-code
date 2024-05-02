import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { nanoid } from "nanoid";



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

export async function POST(req: NextRequest) {
  const { fileContents }: { fileContents:{ name: string; content: string }[] } = await req.json();
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY as string });
  const indexName = "find-code-index";

  try {
    for(const fileContent of fileContents) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: fileContent.content,
        encoding_format: "float",
      });

      const index = pc.index(indexName);

      const addedEmbedding = await index.namespace("ns1").upsert([
        {
          id: nanoid(7),
          values: embedding.data[0].embedding,
          metadata:{
            codeContent:fileContent.content,
            fileName:fileContent.name,
          }
        },
      ]);

    }

 

      return NextResponse.json({
        success: true,
      });
    }
   catch (error) {
    console.log(error);
    return new NextResponse(JSON.stringify(error), { status: 500 });
  }
}
