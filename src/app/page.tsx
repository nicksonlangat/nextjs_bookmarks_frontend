"use client";
import { useEffect, useState } from "react";
import { Bookmark } from "./models/bookmark";
import axiosInstance from "./axiosInstance";
import Link from "next/link";
import { Toaster, toast } from "sonner";

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentId, setID] = useState<number>(0);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBookmarks, setFilteredBookmarks] = useState<any[]>(bookmarks);

  const fetchBookmarks = async () => {
    try {
      const response = await axiosInstance.get("get-bookmarks/");
      setBookmarks(response.data);
    } catch (error) {
      setErrorMessage("Error fetching bookmarks");
      toast.error(errorMessage)
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveBookmark = async () => {
    try {
      if (!url) {
        setErrorMessage("Please provide a valid URL");
        toast.error("Please provide a valid URL")
        return;
      }
      setErrorMessage(null);

      setSaving(true);
      await axiosInstance.post("add-bookmarks/", { url });

      setSaving(false);
      toast.success("Bookmark saved!")
      await fetchBookmarks();

      setUrl("");
    } catch (error) {
      setSaving(false);
      console.error("Error saving bookmark:", error);
      setErrorMessage("Failed to save bookmark");
    }
  };

  const deleteBookmark = async (id: number) => {
    try {
      setDeleting(true);
      setID(id);
      await axiosInstance.delete(`delete-bookmark/${id}/`);

      setDeleting(false);
      setID(0);
      toast.success("Bookmark deleted!");
      await fetchBookmarks();
    } catch (error) {
      setDeleting(false);
      console.error("Error deleting bookmark:", error);
      setErrorMessage("Failed to delete bookmark");
      toast.error("Failed to delete bookmark");
    }
  };

  const truncateText = (text: string, maxWords: number) => {
    const wordsArray = text.split(" ");
    if (wordsArray.length > maxWords) {
      return wordsArray.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredBookmarks(bookmarks);
    } else {
      // Filter bookmarks based on the search query (case-insensitive)
      const filtered = bookmarks.filter((bookmark) =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBookmarks(filtered);
    }
  }, [searchQuery, bookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="bg-dark-800 border-b border-dark-700 text-white fixed top-0 left-0 w-full z-10">
        <div className="max-w-screen-xl mx-auto p-8"></div>
      </nav>
      <Toaster />

      <div className="pt-20 p-5 container mx-auto flex items-center justify-center">
        <div className="space-y-4 w-full">
          <div className="flex lg:flex-row flex-col gap-5 mb-5">
            <div className="lg:w-2/3 flex gap-5">
              <div className="w-full relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="py-3 bg-dark-800 placeholder:text-[#ababab] pl-5 focus:ring-0 focus:outline-none border border-indigo-500 rounded-lg w-full"
                  placeholder="Enter bookmark url"
                />

                <div className="absolute right-2 top-1.5 ">
                  {saving ? (
                    <button
                      disabled
                      className="py-2 px-6 rounded-md flex gap-2 items-center justify-center bg-indigo-600 text-white w-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                        className="size-4 animate-spin"
                        fill="currentColor"
                      >
                        <g transform="translate(50 50)">
                          {Array.from({ length: 12 }).map((_, i) => (
                            <rect
                              key={i}
                              x="-3"
                              y="-35"
                              width="8"
                              height="36"
                              rx="3"
                              ry="3"
                              fill="currentColor"
                              style={{
                                transform: `rotate(${
                                  i * 30
                                }deg) translate(0, -28px)`,
                                opacity: `${(i + 1) / 12}`,
                              }}
                            />
                          ))}
                        </g>
                      </svg>
                      Saving...
                    </button>
                  ) : (
                    <button
                      onClick={saveBookmark}
                      className="py-2 rounded-md px-6 flex gap-2 items-center justify-center bg-indigo-600 text-white w-full"
                    >
                      Save Bookmark
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 bg-dark-800 placeholder:text-[#ababab] pl-5 focus:ring-0 focus:outline-none border border-dark-700 rounded-lg w-full"
                placeholder="Search links"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 gap-y-5">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-dark-800 border border-dark-700 rounded-lg"
              >
                <div className="p-3 bg-dark-900 rounded-t-lg flex gap-2 items-center">
                  <img
                    src={bookmark.image_url}
                    
                    className="size-8 rounded-full object-cover"
                  />
                  <p>{truncateText(bookmark.title, 20)}</p>
                </div>
                <hr className=" border-dark-700" />
                <div className="p-3 overflow-hidden">
                  <p className="text-white/70 text-sm mt-2">
                    {truncateText(bookmark.description, 20)}
                  </p>

                  <div className="flex justify-between items-center mt-5">
                    <div className="flex gap-5">
                      <button
                        onClick={() => copyToClipboard(bookmark.url)}
                        className="py-2 hover:bg-blue-500 hover:text-white transition-all duration-700 ease-in-out flex gap-2 items-center px-4 rounded-md text-sm text-[#ababab]/50 bg-dark-600"
                      >
                        Copy
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                          <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                        </svg>
                      </button>
                      <Link
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="py-2 hover:bg-indigo-500 hover:text-white transition-all duration-700 ease-in-out flex gap-2 items-center px-4 rounded-md text-sm text-[#ababab]/50 bg-dark-600">
                          Visit
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M17 7l-10 10" />
                            <path d="M8 7l9 0l0 9" />
                          </svg>
                        </button>
                      </Link>
                    </div>
                    <div>
                      {deleting && currentId == bookmark.id ? (
                        <button
                          disabled
                          className="py-2 text-sm px-4 rounded-md flex gap-2 items-center justify-center bg-rose-500 text-white w-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            className="size-4 animate-spin"
                            fill="currentColor"
                          >
                            <g transform="translate(50 50)">
                              {Array.from({ length: 12 }).map((_, i) => (
                                <rect
                                  key={i}
                                  x="-3"
                                  y="-35"
                                  width="8"
                                  height="36"
                                  rx="3"
                                  ry="3"
                                  fill="currentColor"
                                  style={{
                                    transform: `rotate(${
                                      i * 30
                                    }deg) translate(0, -28px)`,
                                    opacity: `${(i + 1) / 12}`,
                                  }}
                                />
                              ))}
                            </g>
                          </svg>
                          Deleting...
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="py-2 hover:bg-rose-500 hover:text-white transition-all duration-700 ease-in-out flex gap-2 items-center px-4 rounded-md text-sm text-[#ababab]/50 bg-dark-600"
                        >
                          Delete
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 7l16 0" />
                            <path d="M10 11l0 6" />
                            <path d="M14 11l0 6" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
