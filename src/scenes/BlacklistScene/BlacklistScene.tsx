import { useEffect } from "react";
import { Tweet, StyledButton } from "src/components";
import { useStore } from "src/stores/rootStore";
import { BLACKLIST_TAG } from "src/utils/constants";
import styled from "styled-components";

export const BLACKLIST_URL = "blacklist";

const BlacklistContainer = styled.div`
  margin: 120px auto;
`;

export default function BlacklistScene() {
  const loadedTweets: TweetSchema[] = useStore(
    (state) =>
      state.tags
        .get(BLACKLIST_TAG)
        ?.images.filter((im) => !!(im as TweetSchema).data) ?? []
  );
  const allTweets: TweetSchema[] = useStore(
    (state) => state.tags.get(BLACKLIST_TAG)?.images ?? []
  );

  const loadTweetData = useStore((state) => state.loadTweetData);

  useEffect(() => {
    const unfetchedImages = allTweets.filter((im) => !im.data);
    const imagesToFetch = unfetchedImages.slice(0, 100);

    loadTweetData(imagesToFetch.filter((im) => !im.loading));
  }, [allTweets, loadTweetData]);

  return (
    <BlacklistContainer>
      <h3>Blacklist - {allTweets.length}</h3>
      {loadedTweets.map((t) => (
        <BlacklistedTweet tweet={t} key={t.id} />
      ))}
    </BlacklistContainer>
  );
}

function BlacklistedTweet(props: { tweet: TweetSchema }) {
  return (
    <div>
      <StyledButton>Remove Blacklist</StyledButton>
      <Tweet data={props.tweet.data!} />
    </div>
  );
}
