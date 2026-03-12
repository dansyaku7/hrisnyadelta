"use client";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}
export default function CkRichTextEditor({ value, onChange, disabled }: Props) {
  return (
    <div>
      <CKEditor
        editor={ClassicEditor as any}
        data={value}
        disabled={disabled}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          toolbar: [
            "heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "blockQuote",
            "|", "undo", "redo", "insertTable", "outdent", "indent", "imageUpload"
          ],
        }}
      />
    </div>
  );
}
