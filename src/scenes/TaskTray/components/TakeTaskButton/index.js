import React from 'react';
import { Row, Col, Button } from 'antd';

export default function(props) {
  return (
    <Row gutter={24}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'right' }}>
        <Button
          onClick={props.takeTask}
          loading={props.isLoading}
          type="primary"
          shape="round"
          style={{ backgroundColor: '#1e8e3e', borderColor: '#1e8e3e' }}
        >
          Tomar tarea
        </Button>
      </Col>
    </Row>
  );
}
