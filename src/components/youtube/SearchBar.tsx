
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search videos..."
        className="pl-10 bg-gray-800 border-gray-700 text-gray-100"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
