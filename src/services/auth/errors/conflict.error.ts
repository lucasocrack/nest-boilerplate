import { HttpException, HttpStatus } from '@nestjs/common';

export class ConflictError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class EmailConflictError extends ConflictError {
  constructor() {
    super('Email address is already in use.');
  }
}

export class UsernameConflictError extends ConflictError {
  constructor() {
    super('Username is already in use.');
  }
}

export class CpfCnpjConflictError extends ConflictError {
  constructor() {
    super('CPF is already in use.');
  }
}
