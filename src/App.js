import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  ListGroup,
  Badge,
  Button,
} from "react-bootstrap";
import Axios from "axios";
import "./App.css";
import dataSource from "./dataSource.json";

function App() {
  const [providers] = useState(dataSource.providersList);
  const [servicesActualData] = useState(dataSource.serviceList);
  const [services, setServices] = useState(dataSource.serviceList);
  const [formData, setformData] = useState({
    provider: dataSource.providersList[0].value,
    services: [],
  });

  const onProviderChangeHandler = (e) => {
    setformData({ ...formData, provider: e.target.value, services: [] });
    const tempServices = { ...services };
    tempServices[e.target.value].forEach((service) => {
      service.checked = false;
    });
    setServices(tempServices);
  };

  const onServiceChangeHandler = (e, id) => {
    const temp = { ...services };
    const tempIndex = temp[formData.provider].findIndex(
      (item) => item.id === id
    );
    const tempItem = temp[formData.provider][tempIndex];
    tempItem.checked = !tempItem.checked;
    setServices(temp);
    const tempServices = [...formData.services];
    if (tempItem.checked) {
      tempServices.push(tempItem);
      setformData({ ...formData, services: tempServices });
    } else {
      const tempServiceIndex = tempServices.findIndex(
        (tempService) => tempService.id === tempItem.id
      );
      tempServices.splice(tempServiceIndex, 1);
      setformData({ ...formData, services: tempServices });
    }
  };

  const onClearAllHandler = () => {
    setformData({ ...formData, services: [] });
    const tempServices = { ...services };
    tempServices[formData.provider].forEach((service) => {
      if (service.checked) service.checked = false;
    });
    setServices(tempServices);
  };

  const onRemoveSelectedService = (id) => {
    onServiceChangeHandler(null, id);
  };

  const onSearchHandler = (e) => {
    const value = e.target.value;
    if (value.length > 2) {
      const temp = { ...servicesActualData };
      const tempItems = temp[formData.provider];
      const tempSearchResult = tempItems.filter(
        (item) =>
          item.name.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
      );
      setServices({ ...services, [formData.provider]: tempSearchResult });
    }
    if (value.length === 0) {
      setServices(servicesActualData);
    }
  };

  const generateCodeHandler = async () => {
    let payload = [];
    formData.services.map((data) => {
      if (data.value) {
        payload.push(data.value);
      }
      return null;
    });
    if (payload.length === 0) {
      payload = ["gcs", "bucket"];
    }
    const result = await Axios.post(
      "https://tfcdgenservice-kcjmvrikkq-uc.a.run.app/list/",
      payload,
      {
        responseType: "blob",
        headers: { contentType: "application/json" },
      }
    );
    const { data } = result;
    const blobUrl = new Blob([data], { type: data.type });
    const downloadUrl = window.URL.createObjectURL(blobUrl);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "tf.zip");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Container className="App pt-4">
      <h1>
        <strong>Terraform Initializer</strong>
      </h1>
      <hr></hr>
      <Row>
        <Col xs={4} className="border-right">
          <h4 className="mb-3">
            <b>Providers</b>
          </h4>
          {providers.map((provider, index) => (
            <Form.Check
              className="mb-2"
              key={provider.id}
              type="radio"
              label={provider.name}
              name="provider"
              value={provider.value}
              checked={provider.value === formData.provider}
              onChange={(e) => onProviderChangeHandler(e)}
            />
          ))}
        </Col>
        <Col xs={8} className="px-4">
          <h4>
            <b>Services</b>
          </h4>
          {formData.services.length > 0 && (
            <p>
              <small>Total selected: {formData.services.length}</small>
            </p>
          )}
          <div className="mb-2">
            {formData.services.map(
              (service, i) =>
                service.checked && (
                  <Badge
                    pill
                    className="mx-1 mb-1 px-4 border-darks"
                    bg="primary"
                    text="light"
                    key={service.id}
                  >
                    <span className="mx-2">{service.name}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRemoveSelectedService(service.id)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </Button>
                  </Badge>
                )
            )}
            {formData.services.length > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => onClearAllHandler()}
              >
                Clear All
              </Button>
            )}
          </div>
          <Form.Control
            className="mb-2"
            type="text"
            placeholder="Type to begin search.."
            onChange={(e) => onSearchHandler(e)}
          />
          <ListGroup>
            {services[formData.provider].map((service, i) => (
              <ListGroup.Item className="py-3" key={service.id}>
                <Form.Check
                  checked={service.checked}
                  inline
                  aria-label={service.name}
                  name={`service-${service.name}`}
                  onChange={(e) => onServiceChangeHandler(e, service.id)}
                  label={service.name}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button
            variant={`${
              formData.services.length === 0
                ? "outline-dark"
                : "outline-primary"
            }`}
            disabled={formData.services.length === 0}
            className="w-50 my-5 py-2 mx-auto"
            onClick={(e) => generateCodeHandler(e)}
          >
            Generate Code
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
