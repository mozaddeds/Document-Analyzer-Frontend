import { Roboto_Condensed } from "next/font/google";
import Squares from "../components/Squares";
import FileInput from "../components/Input/FileInput";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${robotoCondensed.className}`}>
        <h1 className="text-4xl mb-4 text-white">Hello!</h1>
        <h4 className="w-150 text-center text-white/90">
          Welcome! This is a simple document summarizing web application built using Next.js and Gemin's API. The app allows users to input a file, and generates a concise summary using Gemini's language model. It's designed to help users quickly understand the main points of any document without having to read through the entire content.
        </h4>
        <FileInput />
      </div>
    </div>
  );
}