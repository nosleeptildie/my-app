export const handleChange = (file, setPdfUrl) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const blob = new Blob([e.target.result], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  reader.readAsArrayBuffer(file);
};
