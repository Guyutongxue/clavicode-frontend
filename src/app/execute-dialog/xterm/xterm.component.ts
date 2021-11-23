// Copyright (C) 2021 Clavicode Team
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

import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Terminal } from 'xterm';
import { ExecuteService } from 'src/app/services/execute.service';
import { filter, map, timeout } from 'rxjs/operators';

const TERM_FONT_FAMILY = `"等距更纱黑体 SC", "Cascadia Code", Consolas, "Courier New", Courier, monospace`;
const TERM_FONT_SIZE = 14;
const TERM_COLS = 80;
const TERM_ROWS = 25;

let _canvas: HTMLCanvasElement;
export function terminalWidth() {
  const canvas = _canvas ?? (_canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d')!;
  context.font = `${TERM_FONT_SIZE}px ${TERM_FONT_FAMILY}`;
  const ratio = window.devicePixelRatio;
  return Math.floor(context.measureText('m').width * ratio) * TERM_COLS / ratio;
}

@Component({
  selector: 'app-xterm',
  templateUrl: './xterm.component.html',
  styleUrls: ['./xterm.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class XtermComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private executeService: ExecuteService) { }

  private closing = false;
  @Output() close = new EventEmitter();

  private readonly term = new Terminal({
    fontFamily: TERM_FONT_FAMILY,
    fontSize: TERM_FONT_SIZE,
    cols: TERM_COLS,
    rows: TERM_ROWS
  });

  ngOnInit(): void {
    this.term.open(this.document.getElementById('executeXterm')!);
    this.term.focus();
    this.term.onData(data => {
      if (this.closing) {
        this.close.emit();
      } else {
        this.executeService.sender?.next({
          type: 'tin',
          content: data
        });
      }
    });
    this.executeService.receiver?.subscribe(data => {
      if (data.type === 'tout') {
        this.term.write(data.content);
      } else if (data.type === 'closed' || data.type === 'error') {
        this.term.write('\r\n----------\r\n');
        if (data.type === 'closed') {
          this.term.write(`运行结束，退出代码 ${(data.exitCode).toString()}。\r\n`);
        } else {
          if (data.reason === 'timeout') {
            this.term.write(`程序运行时间超出限制。\r\n`);
          } else if (data.reason === 'memout') {
            this.term.write(`程序运行内存超出限制。\r\n`);
          } else if (data.reason === 'violate') {
            this.term.write(`程序行为被禁止。\r\n`);
          } else if (data.reason === 'system') {
            this.term.write(`服务器异常，请及时联系我们。\r\n`);
          } else if (data.reason === 'other') {
            this.term.write(`程序因运行时错误终止。\r\n`);
          } else {
            this.term.write(`未知错误。\r\n`);
          }
        }
        this.term.write('按任意键关闭窗口。\r\n');
        this.closing = true;
      }
    })
  }

}
