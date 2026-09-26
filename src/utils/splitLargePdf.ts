import { PDFDocument } from 'pdf-lib';

export interface PdfPart {
  file: File;
  index: number;
  total: number;
}

export const splitPdfByMaxBytes = async (file: File, maxBytes: number): Promise<PdfPart[]> => {
  if (!/\.pdf$/i.test(file.name)) {
    throw new Error('Only PDF files can be split automatically.');
  }
  if (file.size <= maxBytes) return [{ file, index: 1, total: 1 }];
  if (maxBytes <= 0) throw new Error('Invalid maximum upload size');

  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const pageCount = source.getPageCount();
  const parts: Uint8Array[] = [];
  let current = await PDFDocument.create();

  const flush = async () => {
    if (current.getPageCount() === 0) return;
    parts.push(await current.save({ useObjectStreams: true }));
    current = await PDFDocument.create();
  };

  for (let i = 0; i < pageCount; i++) {
    const [page] = await current.copyPages(source, [i]);
    current.addPage(page);

    const candidate = await current.save({ useObjectStreams: true });
    if (candidate.byteLength > maxBytes && current.getPageCount() > 1) {
      current.removePage(current.getPageCount() - 1);
      await flush();
      const [singlePage] = await current.copyPages(source, [i]);
      current.addPage(singlePage);
      const single = await current.save({ useObjectStreams: true });
      if (single.byteLength > maxBytes) {
        throw new Error(`Page ${i + 1} is larger than the maximum upload size and cannot be split without altering the PDF.`);
      }
    } else if (candidate.byteLength > maxBytes) {
      throw new Error(`Page ${i + 1} is larger than the maximum upload size and cannot be split without altering the PDF.`);
    }
  }

  await flush();

  const total = parts.length;
  return parts.map((bytes, i) => {
    const name = file.name.replace(/\.pdf$/i, '');
    const partName = `${name}.part-${String(i + 1).padStart(3, '0')}-of-${String(total).padStart(3, '0')}.pdf`;
    return { file: new File([bytes], partName, { type: 'application/pdf' }), index: i + 1, total };
  });
};
