import "./App.css";
import React, { useState } from "react";
import { Button, Form, Upload, InputNumber, Row, Col } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { download } from "./lib/download";
import { PDFDocument, cmyk, degrees } from "pdf-lib";
import { scaleCalc } from "./lib/scaleCalc";
import { handleChange } from "./lib/handleChange";
import { flood } from "./lib/flood";

const App = () => {
  const [form] = Form.useForm();
  const [bufferState, setBufferState] = useState();
  const [lines, setLines] = useState();
  const [pdfUrl, setPdfUrl] = useState();
  const [resultPdf, setResultPdf] = useState();

  // PDF c DataMatrix
  const modifiedPdf = async () => {
    const dmtx_size = form.getFieldValue("dmtx_size");
    const floods = form.getFieldValue("rychi");
    const x = form.getFieldValue("x_point");
    const y = form.getFieldValue("y_point");
    const repeatRigth = form.getFieldValue("x_indent");
    const repeatTop = form.getFieldValue("y_indent");
    const scale = scaleCalc(dmtx_size);
    
    const pdfDoc = await PDFDocument.load(bufferState);
    const page = pdfDoc.getPage(0);
    
    flood(floods, lines, page, scale, x, y, repeatRigth, repeatTop, dmtx_size)

    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
  };
  // Загрузка результатного PDF
  const handleDownload = async () => {
    download(await modifiedPdf());
  };
  //Обновить превью PDF
  const changePrewiev = async () => {
   
    const blob = new Blob([await modifiedPdf()], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    setResultPdf(objectUrl);
  };
  //Буфер загружаемого файла
  const handleBeforeUpload = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    setBufferState(buffer);

    handleChange(file, setPdfUrl);

    console.log("Буфер файла:", buffer);

    return false;
  };
  //Чтение строк в txt
  const handleFileRead = (filtxt) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target.result;
        const linesArray = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        setLines(linesArray);
        resolve();
      };
      reader.readAsText(filtxt);
      return false;
    });
  };
  const beforeUploadTxt = (file) => {
    handleFileRead(file);
    return false;
  };

  return (
    <>
      <Row>
        <Form
          form={form}
          name="basic"
          layout={"vertical"}
          style={{ maxWidth: 255, padding: 10 }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Row gutter={12}>
            {/* Загрузить файл PDF */}
            <Col span={12}>
              <Form.Item name="file">
                <Upload
                  beforeUpload={handleBeforeUpload}
                  accept=".pdf"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>PDF</Button>
                </Upload>
              </Form.Item>
            </Col>

            {/* Загрузить файл TXT */}
            <Col span={12}>
              <Form.Item name="filtxt">
                <Upload
                  beforeUpload={beforeUploadTxt}
                  accept=".txt"
                  maxCount={1}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={!pdfUrl ? true : false}
                  >
                    TXT
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {/* Ручьи */}
            <Col span={12}>
              <Form.Item
                label="Ручьи"
                name="rychi"
                rules={[
                  { required: true, message: "Необходимо ввести кол-во ручев" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} disabled={false}/>
              </Form.Item>
            </Col>

            {/* Размер кода */}
            <Col span={12}>
              <Form.Item
                label="Размер кода"
                name="dmtx_size"
                style={{ maxWidth: 350 }}
                rules={[
                  {
                    required: true,
                    message: "Введите размер DataMAtrix код в мм",
                  },
                ]}
              >
                <InputNumber
                  onChange={changePrewiev}
                  disabled={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {/* Коор-ты Х */}
            <Col span={12}>
              <Form.Item
                label="Положение X"
                name="x_point"
                rules={[{ required: true, message: "Введите положение X" }]}
              >
                <InputNumber disabled={false} />
              </Form.Item>
            </Col>

            {/* Коор-ты У */}
            <Col span={12}>
              <Form.Item
                label="Положение Y"
                name="y_point"
                rules={[{ required: true, message: "Введите положение Y" }]}
              >
                <InputNumber disabled={false} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {/* Отступ Х */}
            <Col span={12}>
              <Form.Item
                label="Отступ X"
                name="x_indent"
                rules={[{ required: true, message: "Введите отступ X" }]}
              >
                <InputNumber disabled={false} />
              </Form.Item>
            </Col>

            {/* Отступ У */}
            <Col span={12}>
              <Form.Item
                label="Отступ Y"
                name="y_indent"
                rules={[{ required: true, message: "Введите отступ Y" }]}
              >
                <InputNumber disabled={ false} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {/* Обновить */}
            <Col span={12}>
              <Button
                onClick={changePrewiev}
                style={{ marginTop: 15 }}
                disabled={true}
              >
                Обновить
              </Button>
            </Col>

            {/* Скачать файл PDF */}
            <Col span={12}>
              <Form.Item name="filedownload">
                {bufferState && lines && (
                  <Button
                    type="primary"
                    onClick={handleDownload}
                    icon={<DownloadOutlined />}
                    style={{ marginTop: 15 }}
                  >
                    Скачать PDF
                  </Button>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Фрейм для PDF */}
        <Col span={12}>
          <div
            style={{
              height: "calc(100vh - 48px)",
              border: "1px solid #d9d9d9",
              borderRadius: 2,
              padding: 8,
              background: pdfUrl ? "none" : "#fafafa",
            }}
          >
            {pdfUrl ? (
              <iframe
                src={!lines ? pdfUrl : resultPdf}
                title="PDF Preview"
                width="100%"
                height="100%"
                style={{ border: "none" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#bfbfbf",
                }}
              >
                <span>Превью PDF появится здесь</span>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};
export default App;
