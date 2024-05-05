import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { nanoid } from "nanoid";
import { openai, pc } from "../../../lib/utils";

export async function GET(req: NextRequest) {
  const fileContents: { name: string; content: string }[] = await req.json();
  const indexName = "find-code-index";

  try {
    for (const fileContent of fileContents) {
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
          metadata: {
            codeContent: fileContent.content,
            fileName: fileContent.name,
          },
        },
      ]);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error, success: false }, {status:500});
  }
}
