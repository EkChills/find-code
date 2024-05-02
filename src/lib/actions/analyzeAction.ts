"use server";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { nanoid } from "nanoid";
import { openai, pc } from "../utils";



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

export async function analyzeAction( fileContents:{ name: string; content: string }[] , formData?:FormData) {
  

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

 

      return{
        success: true,
      };
    }
   catch (error) {
    console.log(error);
    return {error, success: false};
  }
}



// export async function analyzeAction(input: { name: string; content: string }[], formData?: FormData) {
//   console.log("the input", input);

//   try {
//     const createdEmbeddings = await axios.post('http://localhost:3000/api/createEmbedding', {
//       input,
//     });
//     const data = await createdEmbeddings.data;
//     if (data) return { success: true };
//   } catch (error) {
//     console.log(error);
//     if (error instanceof AxiosError) {
//       return {
//         success: false,
//         isError: true,
//         code: error.status,
//         message: error.message,
//       };
//     }
//   }
// }
