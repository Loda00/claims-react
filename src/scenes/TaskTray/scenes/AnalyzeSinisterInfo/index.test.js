import React from 'react';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { FormAnalizar } from './index';

afterEach(cleanup);

it('existe el boton completar en el formulario', () => {
  const { getByText } = render(<FormAnalizar />);

  const botonCompletar = getByText('Completar');

  expect(botonCompletar).toBeInTheDocument();
});
