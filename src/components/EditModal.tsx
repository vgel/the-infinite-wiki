import { useState } from "react";
import { Close } from "./Icons";

export interface EditModalProps {
  close: () => void;
  onSubmit: (content: string) => void;
}

const EditModal: React.FC<EditModalProps> = (props) => {
  const [content, setContent] = useState("");

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={(e) => {
          console.log(e.target, e.currentTarget);
          if (e.target === e.currentTarget) {
            props.close();
          }
        }}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto flex flex-col gap-2">
        <button className="absolute top-2 right-2" onClick={props.close}>
          <Close />
        </button>
        <h2 className="text-2xl font-semibold">Edit Page</h2>
        <p>Add a summary of the edit you&apos;d like to apply to the page.</p>
        <textarea
          className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 resize-none mb-4"
          placeholder="Add a section about..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <div className="flex justify-end">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none mr-2"
            onClick={() => {
              props.onSubmit(content);
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
