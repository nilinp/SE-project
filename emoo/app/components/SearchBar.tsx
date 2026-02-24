"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
    const [search, setSearch] = useState("");

    return (
        <div className="w-[320px]">
            <div className="relative w-[320px]">

                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#CBB6A5] text-[#2B2343]
                     placeholder:text-[#2B2343]/60
                     rounded-full py-3 pl-5 pr-12
                     outline-none"
                />

                <Search
                    className="absolute right-4 top-1/2 -translate-y-1/2
                     w-5 h-5 text-[#2B2343]"
                />

            </div>
        </div>
    );
}