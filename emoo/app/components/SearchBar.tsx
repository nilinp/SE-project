import { Search, SearchIcon } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative w-96">
            <input
                type="text"
                placeholder="Search..."
                className="
            bg-(--main)
            px-6
            py-2
            w-full
            rounded-full
            outline-none
            text-(--bg)
            placeholder:text-(--bg)/70  
            "/>

            <button type="submit" className="
            absolute
            right-1
            top-1/2
            -translate-y-1/2
            bg-(--bg)
            px-2
            py-2
            rounded-full
            hover:bg-(--bg)/70
            transition
            cursor-pointer
            flex
            items-center
            justify-center
            ">
                <SearchIcon size={20} className="text-(--main)" />
            </button>
        </div>
    );
}