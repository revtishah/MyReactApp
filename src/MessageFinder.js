import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function MessageFinder() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const findMessage = async (e) => {
    // Prevent the default form submit action if findMessage is used as onSubmit
    // e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/get-message/${name}`);
      if (!response.ok) {
        throw new Error('Message not found');
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching message:', error);
      setMessage('Message not found.');
    }
  };

  return (
    <div>
      <h4>Get Message from API</h4>
      <Form>
        <Form.Group as={Row} className="mb-3" controlId="formName">
          <Form.Label column sm={2} className='text-left'>
            Enter Name
          </Form.Label>
          <Col sm={10}>
            <Form.Control 
              type="text" 
              placeholder="Enter Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Col sm={{ span: 10, offset: 2 }}>
            {/* Change type to "button" and add an onClick handler */}
            <Button type="button" onClick={findMessage}>Find Message</Button>
          </Col>
        </Form.Group>
      </Form>
      {/* Use a more semantic tag for displaying messages */}
      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}
    </div>
  );
}

export default MessageFinder;
