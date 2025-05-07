import "./App.css";
import React, { useState } from "react";
import { Button, Form, Upload, InputNumber, Row, Col } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { download } from "./lib/download";
import { generateDataMatrixSvg } from "./lib/generateDataMatrixSvg";
import { drawCode } from "./lib/drawCode";
import { PDFDocument, cmyk } from "pdf-lib";

const App = () => {
  const [form] = Form.useForm();
  const [bufferState, setBufferState] = useState();
  const [lines, setLines] = useState();
  //Скачивание файла PDF
  // const download = useDownload();

  const handleDownload = async () => {
    const dataMatrixSvg = await generateDataMatrixSvg(lines[0])
    const pdfDoc = await PDFDocument.load(bufferState);
    const page = pdfDoc.getPage(0);
    drawCode(page, dataMatrixSvg, 170, 87, 50)
    const modifiedPdfBytes = await pdfDoc.save();

    download(modifiedPdfBytes);
  }

  

  //Логи на кпопке "Обновить"
  const onClick = () => {
    console.log(bufferState);
    console.log(lines);
    console.log(form.getFieldsValue());
  };
  //Буфер загружаемого файла
  const handleBeforeUpload = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    setBufferState(buffer);

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
      style={{ maxWidth: 270, padding: 10 }}
      initialValues={{ remember: true }}
      autoComplete="off"
    >
      <Row gutter={24}>
        {/* Загрузить файл PDF */}
        <Col span={12}>
          <Form.Item name="file">
            <Upload
              beforeUpload={handleBeforeUpload}
              accept=".pdf"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Загрузить PDF</Button>
            </Upload>
          </Form.Item>
        </Col>

        {/* Загрузить файл TXT */}
        <Col span={12}>
          <Form.Item name="filtxt">
            <Upload beforeUpload={beforeUploadTxt} accept=".txt" maxCount={1}>
              <Button icon={<UploadOutlined />}>Загрузить TXT</Button>
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

      <Row>
        {/* Обновить */}
        <Col span={12}>
          <Button onClick={onClick} style={{ marginBottom: 20 }}>
            Обновить
          </Button>
        </Col>

        {/* SVG */}
        <Col span={12}>
          <Button onClick={handleDownload} style={{ marginBottom: 20 }}>
            SVG
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Скачать файл PDF */}
        <Col span={24}>
          <Form.Item name="filedownload">
            {bufferState && (
              <Button
                type="primary"
                onClick={handleDownload}
                icon={<DownloadOutlined />}
              >
                Скачать PDF
              </Button>
            )}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
export default App;
