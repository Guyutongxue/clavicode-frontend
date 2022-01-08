// Copyright (C) 2022 Clavicode Team
// 
// This file is part of clavicode-frontend.
// 
// clavicode-frontend is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// clavicode-frontend is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with clavicode-frontend.  If not, see <http://www.gnu.org/licenses/>.

import { Injectable } from '@angular/core';
import { PyodideRemote } from '../pyodide/type';
import * as Comlink from 'comlink';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogService } from '@ngneat/dialog';
import { ExecuteDialogComponent } from '../execute-dialog/execute-dialog.component';
import { terminalWidth } from '../execute-dialog/xterm/xterm.component';
import { StatusService } from './status.service';

const INPUT_BUF_SIZE = 128 * 1024;
const encoder = new TextEncoder();

export interface ILocalTermService {
  readRequest: Subject<void>;
  readResponse: Subject<string>;
  writeRequest: Subject<string>;
  writeResponse: Subject<void>;
  closed: Subject<any>;
}

@Injectable({
  providedIn: 'root'
})
export class PyodideService implements ILocalTermService {

  worker: Comlink.Remote<PyodideRemote>;

  readRequest = new Subject<void>();
  readResponse = new Subject<string>();
  writeRequest = new Subject<string>();
  writeResponse = new Subject<void>();
  closed = new Subject<void>();

  private initPromise: Promise<void>;

  constructor(
    private statusService: StatusService,
    private dialogService: DialogService
  ) {
    if (typeof Worker === 'undefined') throw Error("Web worker not supported");

    const worker = new Worker(new URL('../pyodide/pyodide.worker.ts', import.meta.url));
    this.worker = Comlink.wrap(worker);
    this.initPromise = this.initIo();
  }

  private inputBuffer = new Uint8Array(new SharedArrayBuffer(INPUT_BUF_SIZE));
  // [ len, hasWritten ]
  private inputMeta = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));

  private async input(): Promise<string> {
    this.readRequest.next();
    return this.readResponse.pipe(
      take(1)
    ).toPromise();
  }

  private async output(str: string) {
    this.writeRequest.next(str);
    return this.writeResponse.pipe(
      take(1)
    ).toPromise();
  }

  private async initIo() {
    const inputCb = () => {
      this.input().then((str) => {
        let bytes = encoder.encode(str);
        if (bytes.length > this.inputBuffer.length) {
          alert("Input is too long");
          bytes = bytes.slice(0, this.inputBuffer.length);
        }
        this.inputBuffer.set(bytes, 0);
        Atomics.store(this.inputMeta, 0, bytes.length);
        Atomics.store(this.inputMeta, 1, 1);
        Atomics.notify(this.inputMeta, 1);
      });
    }
    await this.worker.setIo(
      Comlink.proxy(inputCb),
      this.inputBuffer,
      this.inputMeta,
      Comlink.proxy((s) => this.output(s + '\n')),
      Comlink.proxy((s) => this.output(s + '\n'))
    );
  }

  async runCode(code: string) {
    await this.initPromise;
    this.statusService.next('local-executing');
    this.openDialog();
    const result = await this.worker.runCode(code);
    if (result.success) {
      this.close();
    } else {
      this.close(result.error);
    }
  }

  private close(result: any = null) {
    this.statusService.next('ready');
    this.closed.next(result);
  }

  private openDialog() {
    const ref = this.dialogService.open(ExecuteDialogComponent, {
      draggable: true,
      width: `${terminalWidth()}px`,
      dragConstraint: 'constrain'
    });
    ref.afterClosed$.subscribe(() => {
      this.close();
    });
  }

}
