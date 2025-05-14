import "./App.css";
import React, { useState } from "react";
import { Button, Form, Upload, InputNumber, Row, Col, Select } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { download } from "./lib/download";
import { PDFDocument, cmyk, degrees } from "pdf-lib";
import { scaleCalc } from "./lib/scaleCalc";
import { drawCodesOnPage } from "./lib/drawCodesOnPage";
import { copyPdf } from "./lib/copyPdf";

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
    const etikR = form.getFieldValue("etik");
    const rotate = form.getFieldValue("rotate");
    const scale = scaleCalc(dmtx_size);

    const pdfDoc = await PDFDocument.load(bufferState);
    const page = pdfDoc.getPage(0);

debugger
    await drawCodesOnPage(
      floods,
      lines,
      page,
      scale,
      x,
      y,
      repeatRigth,
      repeatTop,
      dmtx_size,
      etikR,
      rotate
    );

    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
  };
  // Загрузка результатного PDF
  const handleDownload = async () => {
    download(await modifiedPdf());
  };
  //Обновить превью PDF
  const changePrewiev = async () => {
    await updatePrewiev(await modifiedPdf(), setResultPdf)
  };
  //Буфер загружаемого файла
  const handleBeforeUpload = async (file) => {

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    await updatePrewiev(await copyPdf(arrayBuffer, setBufferState), setPdfUrl)

    // handleChange(file, setPdfUrl);

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
  //Обновление превью
  const updatePrewiev = async (func, stat) => {
    const blob = new Blob([func], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    stat(objectUrl);
  };

  return (
    <>
      <Row>
        <Form
          form={form}
          name="basic"
          layout={"vertical"}
          style={{ maxWidth: 300, padding: 10 }}
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
            <Col span={8}>
              <Form.Item
                label="Ручьи"
                name="rychi"
                rules={[
                  { required: true, message: "Необходимо ввести кол-во ручев" },
                ]}
              >
                <InputNumber style={{ width: "100%", marginTop: 20 }} disabled={false} />
              </Form.Item>
            </Col>

            {/* Размер кода */}
            <Col span={8}>
              <Form.Item
                label="Размер кода"
                name="dmtx_size"
                style={{ width: "100%" }}
                rules={[
                  {
                    required: true,
                    message: "Введите размер DataMAtrix код в мм",
                  },
                ]}
              >
                <InputNumber onChange={changePrewiev} disabled={false} />
              </Form.Item>
            </Col>

             {/* Этикеток в ручье */}
            <Col span={8}>
              <Form.Item
                label="Эт. в ручье"
                name="etik"
                rules={[
                  { required: true, message: "Необходимо ввести кол-во эт. в ручье" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} disabled={false} />
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
            <Col span={8}>
              <Form.Item
                label="Отступ X"
                name="x_indent"
                rules={[{ required: true, message: "Введите отступ X" }]}
              >
                <InputNumber disabled={false} />
              </Form.Item>
            </Col>

            {/* Отступ У */}
            <Col span={8}>
              <Form.Item
                label="Отступ Y"
                name="y_indent"
                rules={[{ required: true, message: "Введите отступ Y" }]}
              >
                <InputNumber disabled={false} />
              </Form.Item>
            </Col>

            {/* Ротация */}
            <Col span={8}>
              <Form.Item
                label="Ротация"
                name="rotate"
                rules={[{ required: true, message: "Выберите вариант ротации" }]}
              >
              <Select>
               <Select.Option value="I">1</Select.Option>
               <Select.Option value="N">2</Select.Option>
               <Select.Option value="R">3</Select.Option>
               <Select.Option value="L">4</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {/* Заполнить форму */}
            <Col span={12}>
              <Button style={{ marginTop: 15 }}
                onClick={() => {
                  form.setFieldsValue({
                    rychi: 3,
                    x_point: 167,
                    y_point: 101,
                    x_indent: 238,
                    y_indent: 123.5,
                    etik: 7,
                    rotate: "N",
                  });
                }}
              >
                Заполнить
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
