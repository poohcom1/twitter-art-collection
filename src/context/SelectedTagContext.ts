import { createContext } from "react";

interface ISelectedTagContext {
    selectedTag?: TagSchema;
    setSelection: (tag: TagSchema | undefined, invert?: boolean) => void;
    inverted: boolean;
}

const SelectedTagContext = createContext<ISelectedTagContext>(
    { selectedTag: undefined, setSelection: (_tags) => { }, inverted: false }
)


export default SelectedTagContext