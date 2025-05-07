import "./App.css";
import React, { useState } from "react";
import { Button, Form, Upload, InputNumber, Row, Col } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { download } from "./lib/download";
import { generateDataMatrixSvg } from "./lib/generateDataMatrixSvg";
import { drawCode } from "./lib/drawCode";
import { PDFDocument, cmyk } from "pdf-lib";
import { scaleCalc } from "./lib/scaleCalc";
import { handleChange } from "./lib/handleChange";

const App = () => {
  const [form] = Form.useForm();
  const [bufferState, setBufferState] = useState();
  const [lines, setLines] = useState();
  const [pdfUrl, setPdfUrl] = useState();
  

  //Скачивание файла PDF
  const handleDownload = async () => {
    const dmtx_size = form.getFieldValue("dmtx_size");
    const dataMatrixSvg = await generateDataMatrixSvg(lines[0]);
    const pdfDoc = await PDFDocument.load(bufferState);
    const page = pdfDoc.getPage(0);
    const scale = scaleCalc(dmtx_size)
    drawCode(page, dataMatrixSvg, 170, 87, scale, dmtx_size);
    const modifiedPdfBytes = await pdfDoc.save();

    download(modifiedPdfBytes);
  };
  //Логи на кпопке "Обновить"
  const onClick = () => {
    console.log(bufferState);
    console.log(lines);
    console.log(form.getFieldsValue());
    console.log(form.getFieldValue("dmtx_size"));
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
            <Upload beforeUpload={beforeUploadTxt} accept=".txt" maxCount={1}>
              <Button icon={<UploadOutlined />}>TXT</Button>
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
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        {/* Размер кода */}
        <Col span={12}>
          <Form.Item
            label="Размер кода"
            name="dmtx_size"
            style={{ maxWidth: 350 }}
            rules={[
              { required: true, message: "Введите размер DataMAtrix код в мм" },
            ]}
          >
            <InputNumber />
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
            <InputNumber />
          </Form.Item>
        </Col>

        {/* Коор-ты У */}
        <Col span={12}>
          <Form.Item
            label="Положение Y"
            name="y_point"
            rules={[{ required: true, message: "Введите положение Y" }]}
          >
            <InputNumber />
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
            <InputNumber />
          </Form.Item>
        </Col>

        {/* Отступ У */}
        <Col span={12}>
          <Form.Item
            label="Отступ Y"
            name="y_indent"
            rules={[{ required: true, message: "Введите отступ Y" }]}
          >
            <InputNumber />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        {/* Обновить */}
        <Col span={12}>
          <Button onClick={onClick} style={{ marginTop: 10 }}>
            Обновить
          </Button>
        </Col>
     
        {/* Скачать файл PDF */}
        <Col span={12}>
          <Form.Item name="filedownload">
            {bufferState && lines &&(
              <Button
                type="primary"
                onClick={handleDownload}
                icon={<DownloadOutlined />}
                style={{ marginTop: 10 }}
              >
                Скачать PDF
              </Button>
            )}
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item name="iframe">
      {pdfUrl && (
        <div style={{ marginTop: '20px', border: '1px solid #d9d9d9' }}>
          <iframe 
            src={pdfUrl} 
            title="PDF Viewer"
            width="1350px" 
            height="1300px"
            style={{ border: 'none' }}
          />
        </div>
      )}
      </Form.Item>

    </Form>
  );
};
export default App;
