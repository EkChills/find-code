"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco, dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Separator } from "@/components/ui/separator";
import {
  ChangeEvent,
  ChangeEventHandler,
  useState,
  useTransition,
} from "react";
import { analyzeAction } from "@/lib/actions/analyzeAction";
import { searchCodeAction } from "@/lib/actions/searchCodeAction";
import {
  RecordMetadata,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";

export function Hero() {
  const [fileContent, setFileContent] = useState<
    { name: string; content: string }[]
  >([]);
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearching] = useTransition();
  const [searchMatches, setSearchMatches] = useState<
    ScoredPineconeRecord<RecordMetadata>[]
  >([]);
  const [canSearch, setCanSearch] = useState(false);
  const [query, setQuery] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const filesObj = (event.target as HTMLInputElement).files;

    if (filesObj) {
      const filesArray = Array.from(filesObj); // Convert to an array

      filesArray.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          console.log(reader.result, "reader result");
          setFileContent((prev) => [
            ...prev,
            { name: file.name, content: reader.result as string },
          ]);
        };

        reader.readAsText(file);
      });
    }
  };

  async function handleAnalyze() {
    startTransition(async () => {
      const res = await analyzeAction(fileContent);
      if (res.success) {
        setCanSearch(true);
      }
    });
  }

  function handleSearch() {
    startSearching(async () => {
      const result = await searchCodeAction(query);
      console.log(result);
      setSearchMatches(result.matches);
    });
  }

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
      <div className="mx-auto lg:max-w-3xl xl:max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Find parts of your code
        </h1>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="file-input">Add .ts or .tsx files</Label>
              <Input
                accept=".ts,.tsx"
                className="w-full"
                onChange={handleFileChange}
                id="file-input"
                multiple
                type="file"
              />
            </div>
            <Button
              className="w-full"
              style={{
                opacity: isPending ? 0.5 : 1,
              }}
              onClick={handleAnalyze}
              variant="default"
            >
              Analyze code
            </Button>
            {canSearch && (
              <div className="grid gap-1.5">
                <Label htmlFor="search-input">Search code</Label>
                <Input
                  className="w-full"
                  onChange={(e) => setQuery(e.target.value)}
                  id="search-input"
                  placeholder="Enter search string"
                  type="text"
                />
                <Button
                  className="w-full"
                  style={{
                    opacity: isSearching ? 0.5 : 1,
                  }}
                  onClick={handleSearch}
                  variant="default"
                >
                  search code
                </Button>
              </div>
            )}
            <div className="grid gap-2">
              <p className="text-sm font-medium">Top Matches:</p>
              <div className="grid gap-2">
                {searchMatches.map((match, idx) => {
                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm">
                        {match.metadata?.fileName as string}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {match.score}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Uploaded Files
            </h2>
            <div className="grid gap-4">
              {fileContent.map((file, idx) => {
                return (
                  <div
                    key={idx}
                    className="rounded-md border border-gray-200 p-4 dark:border-gray-800 xl:max-w-[40rem] max-w-[100%] lg:max-w-[35rem]  md:max-w-[30rem]"
                  >
                    <p className="text-sm font-medium">{file.name}</p>
                    <Separator className="my-4" />
                    <div className="whitespace-pre-wrap break-words text-sm text-gray-500 dark:text-gray-400 ">
                      <SyntaxHighlighter style={docco} language="typescript">
                        {`// ${file.name}
                  
                  ${file.content}
              `}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
