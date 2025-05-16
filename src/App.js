import "./App.css";
import React, { useState } from "react";
import {
  Button,
  Form,
  Upload,
  InputNumber,
  Row,
  Col,
  Select,
  Typography,
  Progress,
  message,
} from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Buffer } from "buffer";
import { download } from "./lib/download";
import { PDFDocument, cmyk, degrees } from "pdf-lib";
import { scaleCalc } from "./lib/scaleCalc";
import { drawCodesOnPage } from "./lib/drawCodesOnPage";
import { copyPdf } from "./lib/copyPdf";
import { debounce } from "lodash";
import formatIntegerBySpace from "./lib/formatIntegerBySpace";
import { getFirstPage } from "./lib/getFirstPage";


const normFile = (e) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const App = () => {
  const [form] = Form.useForm();
  const [bufferState, setBufferState] = useState(); //PDF
  const [lines, setLines] = useState(); //Массив DataMatrix
  const [pdfUrl, setPdfUrl] = useState(); //PDF до отрисовки
  const [resultPdf, setResultPdf] = useState(); //PDF после отрисовки
  const [pageValue, setPageValue] = useState(); //Кол-во страниц PDF
  const [fileValue, setFileValue] = useState(); //Кол-во файлов PDF


  const [inputValue, setInputValue] = useState(); //Для окна информации
  const [calculatedValue, setCalculatedValue] = useState(); //Для окна информации

  const [progress, setProgress] = useState(0); // Прогресс
  const [processing, setProcessing] = useState(false); // Прогресс
  const [loading, setLoading] = useState(false); // Прелодер


  // PDF c DataMatrix
  const modifiedPdf = async () => {
    const dmtx_size = form.getFieldValue("dmtx_size");
    const floods = form.getFieldValue("rychi");
    const x = form.getFieldValue("x_point");
    const y = form.getFieldValue("y_point");
    const repeatRigth = form.getFieldValue("x_indent");
    const repeatTop = form.getFieldValue("y_indent");
    const etikR = form.getFieldValue("etik");
    const rotate = form.getFieldsValue("rotate");
    const scale = scaleCalc(dmtx_size);
    const etikPage = etikR * floods;

    let index = 0;

    setProcessing(true);
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.load(bufferState);
      for (let i = 0; i < pageValue; i++) {
        const page = pdfDoc.getPage(i);

        let linesSlice = lines.slice(0 + index, etikPage + index)

        await drawCodesOnPage(
          floods,
          linesSlice,
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
        
        index += etikPage;
        console.log(linesSlice);

        const newProgress = Math.floor(((i + 1) / pageValue) * 100);
        setProgress(newProgress);
      }

      const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
      return modifiedPdfBytes;
    } catch (error) {
      message.error("Ошибка обработки: " + error.message);
    } finally {
      setProcessing(false);
    }
  };
 // PDF c DataMatrix для 1 страницы
  const modifiedPdfOnePage = async () => {
    const dmtx_size = form.getFieldValue("dmtx_size");
    const floods = form.getFieldValue("rychi");
    const x = form.getFieldValue("x_point");
    const y = form.getFieldValue("y_point");
    const repeatRigth = form.getFieldValue("x_indent");
    const repeatTop = form.getFieldValue("y_indent");
    const etikR = form.getFieldValue("etik");
    const rotate = form.getFieldValue("rotate");
    const scale = scaleCalc(dmtx_size);
    const etikPage = etikR * floods;
debugger
      const pdfDoc = await PDFDocument.load(bufferState);
        const page = pdfDoc.getPage(0);

        let linesSlice = lines.slice(0, etikPage)

        await drawCodesOnPage(
          floods,
          linesSlice,
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
        console.log(linesSlice);

      const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
      return modifiedPdfBytes;
  };
  // Загрузка результатного PDF
  const handleDownload = async () => {
    await downloadPdfList();
  };

  const downloadPdfList = async () => {
    setLoading(true);
    const modPdf = await modifiedPdf();

    let startIndex = 0;

          for(let i = 0; i < fileValue; i++){
            startIndex = (i = (fileValue - 1) ? pageValue - ((fileValue - 1) * 300) : 300)
            await copyPdf(modPdf, download, pageValue, startIndex)
          }

     setLoading(false)
  }

  //Обновить превью PDF
  const changePrewiev = async () => {
    await updatePrewiev(await modifiedPdfOnePage(), setResultPdf);
    console.log(resultPdf);
  };
  //Буфер загружаемого файла
  const handleBeforeUpload = async (file) => {
    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    await updatePrewiev(
      await copyPdf(arrayBuffer, setBufferState, pageValue),
      setPdfUrl
    );

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
    console.log(resultPdf)
    const changePrewiev = await getFirstPage(func);
    console.log(changePrewiev)
    const blob = new Blob([!resultPdf ? func : changePrewiev], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    stat(objectUrl);
  };
  //Проверка полей
  const onValuesChange = async (data) => {
    console.log(data);
    try {
      await form.validateFields({ validateOnly: false });
      await changePrewiev();
    } catch (e) {
      console.error(e);
    }
  };
  // Расчет правильного тиража и кол-ва страниц + кол-во файлов
  const calcPagePdf = debounce((count) => {
    const etikR = form.getFieldValue("etik");
    const floods = form.getFieldValue("rychi");
    const tiraj = form.getFieldValue("tiraj");

    let etikPage = floods * etikR;
    let pag = Math.ceil(tiraj / etikPage);
    let fil =  Math.ceil(pag / 300);
    let res = pag * etikPage;

    // form.setFieldValue("tiraj", res);
    setPageValue(pag);
    setFileValue(fil);

    setInputValue(tiraj);
    setCalculatedValue(res);

    onValuesChange();
  }, 1500);

  return (
    <>
      <Row>
        <Form
          form={form}
          layout={"vertical"}
          style={{ maxWidth: 480, padding: 10 }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Row gutter={12}>
            {/* Ручьи */}
            <Col span={6}>
              <Form.Item
                label="Ручьи"
                name="rychi"
                rules={[
                  { required: true, message: "Необходимо ввести кол-во ручев" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  disabled={false}
                  onChange={calcPagePdf}
                />
              </Form.Item>
            </Col>

            {/* Этикеток в ручье */}
            <Col span={6}>
              <Form.Item
                label="Эт. в ручье"
                name="etik"
                rules={[
                  {
                    required: true,
                    message: "Необходимо ввести кол-во эт. в ручье",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  disabled={false}
                  onChange={calcPagePdf}
                />
              </Form.Item>
            </Col>

            {/* Тираж */}
            <Col span={6}>
              <Form.Item
                label="Тираж"
                name="tiraj"
                rules={[
                  {
                    required: true,
                    message: "Необходимо ввести тираж",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  disabled={false}
                  onChange={calcPagePdf}
                  formatter={formatIntegerBySpace}
                />
              </Form.Item>
            </Col>

            {/* Размер кода */}
            <Col span={6}>
              <Form.Item
                label="Размер кода"
                name="dmtx_size"
                style={{ width: "100%" }}
                rules={[
                  {
                    required: true,
                    message: "Введите размер DataMatrix кодa в мм",
                  },
                ]}
              >
                <InputNumber onChange={onValuesChange} disabled={false} />
              </Form.Item>
            </Col>
          </Row>

          {/* Инфа по тиражу */}
          <Typography>
            <pre>
              {String(
                "Введенный тираж - " +
                  (!inputValue ? 0 : inputValue) +
                  " шт." +
                  "\nОптимальный тираж - " +
                  (!calculatedValue ? 0 : calculatedValue) +
                  " шт." +
                  "\nКоличество файлов - " +
                  (!fileValue ? 0 : fileValue)
              )}
            </pre>
          </Typography>

          <Row gutter={12}>
            {/* Загрузить файл PDF */}
            <Col span={12}>
              <Form.Item
                name="file"
                rules={[
                  {
                    required: true,
                    message: "Загрузите PDF файл сборки",
                  },
                ]}
                getValueFromEvent={normFile}
                valuePropName={"fileList"}
              >
                <Upload
                  beforeUpload={handleBeforeUpload}
                  accept=".pdf"
                  maxCount={1}
                  onChange={onValuesChange}
                >
                  <Button icon={<UploadOutlined />} disabled={processing}>
                    Загрузить PDF
                  </Button>
                </Upload>
              </Form.Item>
            </Col>

            {/* Загрузить файл TXT */}
            <Col span={12}>
              <Form.Item
                name="filtxt"
                rules={[
                  {
                    required: true,
                    message: "Загрузите TXT файл с DataMatrix",
                  },
                ]}
                getValueFromEvent={normFile}
                valuePropName={"fileList"}
              >
                <Upload
                  beforeUpload={beforeUploadTxt}
                  accept=".txt"
                  maxCount={1}
                  onChange={onValuesChange}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={!pdfUrl ? true : false}
                  >
                    Загрузить TXT
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Инфа по кодам */}
          <Typography>
            <pre>
              {String(
                "Введенно кодов - " +
                  (!lines ? 0 : lines.length) +
                  " шт." +
                  "\nНеобходимо кодов - " +
                  (!calculatedValue ? 0 : calculatedValue) +
                  " шт."
              )}
            </pre>
          </Typography>

          <Row gutter={12}>
            {/* Коор-ты Х */}
            <Col span={12}>
              <Form.Item
                label="Положение X"
                name="x_point"
                rules={[{ required: true, message: "Введите положение X" }]}
              >
                <InputNumber disabled={false} onChange={onValuesChange} />
              </Form.Item>
            </Col>

            {/* Коор-ты У */}
            <Col span={12}>
              <Form.Item
                label="Положение Y"
                name="y_point"
                rules={[{ required: true, message: "Введите положение Y" }]}
              >
                <InputNumber disabled={false} onChange={onValuesChange} />
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
                <InputNumber disabled={false} onChange={onValuesChange} />
              </Form.Item>
            </Col>

            {/* Отступ У */}
            <Col span={12}>
              <Form.Item
                label="Отступ Y"
                name="y_indent"
                rules={[{ required: true, message: "Введите отступ Y" }]}
              >
                <InputNumber disabled={false} onChange={onValuesChange} />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            {/* Ротация */}
            <Col span={12}>
              <Form.Item
                label="Схема намотки"
                name="rotate"
                rules={[
                  { required: true, message: "Выберите вариант ротации" },
                ]}
              >
                <Select onChange={onValuesChange}>
                  <Select.Option value="I">1</Select.Option>
                  <Select.Option value="N">2</Select.Option>
                  <Select.Option value="R">3</Select.Option>
                  <Select.Option value="L">4</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>


            {/* Прогресс бар */}
          <div style={{ marginTop: 20 }}>
            <Progress
              percent={progress}
              status={progress < 100 ? "active" : "success"}
              strokeColor={{
                "0%": "#00CF00",
                "100%": "#00AB00",
              }}
            />
            <div style={{ textAlign: "center", marginTop: 8 }}>
              Обработано: {!pageValue ? 0 : pageValue} из{" "}
              {!pageValue ? 0 : pageValue} страниц
            </div>
          </div>

          <Row gutter={12}>
            {/* Заполнить форму */}
            <Col span={12}>
              <Button
                onChange={onValuesChange}
                style={{ marginTop: 15 }}
                onClick={() => {
                  form.setFieldsValue({
                    rychi: 3,
                    x_point: 167,
                    y_point: 101,
                    x_indent: 238,
                    y_indent: 123.5,
                    etik: 7,
                    rotate: "N",
                    dmtx_size: 9,
                  });
                }}
              >
                Заполнить
              </Button>
            </Col>

            {/* Скачать файл PDF */}
            <Col span={12}>
              {bufferState && lines && (
                <Button
                  type="primary"
                  onClick={handleDownload}
                  icon={<DownloadOutlined />}
                  style={{ marginTop: 15 }}
                  loading={loading}
                >
                  Скачать PDF
                </Button>
              )}
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
