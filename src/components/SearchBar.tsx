"use client";

import React, { useState } from "react";
import { Search } from "./Icons";

interface SearchProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchQuery) {
      onSearch(searchQuery);
      setSearchQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <div className="flex items-center bg-white border border-black">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleInputChange}
          className="flex-1 px-2 text-base focus:outline-none"
        />
        <button type="submit" className="px-4 py-1 bg-black text-white focus:outline-none">
          <Search />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
