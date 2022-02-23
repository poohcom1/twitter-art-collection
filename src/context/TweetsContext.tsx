import React, { createContext, useState } from "react";
import { useContext } from "react";

type TweetData = { id: string; ast: { data: { id: string } }[] };

interface TweetContextType {
  tweets: TweetData[];
  setTweets: (tweets: TweetData[]) => void;
}

const TweetsContext = createContext<TweetContextType | undefined>(undefined);

export function TweetProvider(props: {
  value: TweetData[];
  children: React.ReactNode;
}) {
  const [tweets, setTweets] = useState(props.value);

  return (
    <TweetsContext.Provider value={{ tweets, setTweets }}>
      {props.children}
    </TweetsContext.Provider>
  );
}

export function useTweets(): TweetContextType {
  return useContext(TweetsContext)!;
}
