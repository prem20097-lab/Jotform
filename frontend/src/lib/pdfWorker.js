// Configure pdfjs worker once for the entire app
import { pdfjs } from "react-pdf";

// Use a same-origin static worker (copied from pdfjs-dist) to avoid CORS / CDN issues.
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;

export { pdfjs };
