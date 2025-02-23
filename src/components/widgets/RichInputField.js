import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css'

const RichInputField = ({label, onChange}) => {
    const QuillNoSSRWrapper = dynamic(import('react-quill'), {
        ssr: false,
        loading: () => <p>Loading ...</p>,
    })

    const modules = {
        toolbar: [
            [{header: '1'}, {header: '2'}],
            [{size: []}],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                {list: 'ordered'},
                {list: 'bullet'},
                {indent: '-1'},
                {indent: '+1'},
            ],
            ['link'],
            ['clean'],
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        },
    }
    /*
     * Quill editor formats
     * See https://quilljs.com/docs/formats/
     */
    const formats = [
        'header',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
    ]
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                margin: '1rem',
            }}
        >
            <label>{label}</label>
            <QuillNoSSRWrapper modules={modules} formats={formats} theme="snow"
                               onChange={onChange}
            />
        </div>
    );
}

export default RichInputField;
