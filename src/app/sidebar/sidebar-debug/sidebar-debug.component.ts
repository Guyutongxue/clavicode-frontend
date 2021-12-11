import { Component, OnInit } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ExecuteService } from '../../services/execute.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CompileService } from '../../services/compile.service';
import { EditorService } from '../../services/editor.service';
import { DialogService } from '@ngneat/dialog';
@Component({
  selector: 'app-sidebar-debug',
  templateUrl: './sidebar-debug.component.html',
  styleUrls: ['./sidebar-debug.component.scss']
})
export class SidebarDebugComponent implements OnInit {

  constructor(public router: Router,
    public dialogService: DialogService,
    private executeService: ExecuteService, 
    private compileService: CompileService,
    private editorService: EditorService) {
    // this.iconService.fetchFromIconfont({
    //   scriptUrl: 'https://at.alicdn.com/t/font_2879102_dgzdvy8za0i.js'
    // })
  }

  ngOnInit(): void {
  }
  panels = [
    {
      active: false,
      disabled: false,
      name: '变量查看'
    }
  ];
 
  panels1 = [
    {
      active: false,
      disabled: false,
      name: '表达式求值'
    }
  ];
  
  panels2 = [
    {
      active: false,
      disabled: false,
      name: '调用栈'
    }
  ];

}
