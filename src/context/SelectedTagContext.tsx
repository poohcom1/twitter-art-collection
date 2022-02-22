import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ISelectedTagContext {
  selectedTag?: TagSchema;
  setSelection: (tag: TagSchema | undefined, invert?: boolean) => void;
  inverted: boolean;
}

const SelectedTagContext = createContext<ISelectedTagContext | undefined>(
  undefined
);

export function SelectedTagProvider(props: { children: React.ReactNode }) {
  const [selectedTag, setSelectedTag] = useState<TagSchema | undefined>(
    undefined
  );

  const [inverted, setInverted] = useState(false);

  const value = useMemo(
    () => ({
      selectedTag,
      inverted,
      setSelection: (tag: TagSchema | undefined, invert: boolean = false) => {
        setSelectedTag(tag);
        setInverted(invert);
      },
    }),
    [inverted, selectedTag]
  );

  return (
    <SelectedTagContext.Provider value={value}>
      {props.children}
    </SelectedTagContext.Provider>
  );
}

export function useSelectedTag(): ISelectedTagContext {
  const selectedTag = useContext(SelectedTagContext);

  return selectedTag!;
}
