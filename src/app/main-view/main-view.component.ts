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

import { Component, OnInit } from '@angular/core';
import { ExecuteService } from '../services/execute.service';
import { NavigationEnd, Router } from '@angular/router';
import { CompileService } from '../services/compile.service';
import { EditorService } from '../services/editor.service';
import { DialogService } from '@ngneat/dialog';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  readonly sidebarItems = [
      {
        title: '常用',
        url: 'common',
        icon: 'star',
        disabled: false
      },
      {
        title: '调试',
        url: 'debug',
        icon: 'control',
        disabled: false
      },
      {
        title: '文件',
        url: 'file',
        icon: 'file',
        disabled: false
      },
      {
        title: '题目列表',
        url: 'problem',
        icon: 'unordered-list',
        disabled: false
      },
      {
        title: '搜索',
        url: 'search',
        icon: 'search',
        disabled: false

      }
    ];
  readonly toolsItems = [
    {
      title: '输出',
      url: 'output',
      disabled: false
    },
    {
      title: '调试',
      url: 'debug',
      disabled: false
    },
    {
      title: '问题',
      url: 'problems',
      disabled: false
    }
  ]

  constructor(private router: Router,
    private dialogService: DialogService,
    private executeService: ExecuteService, 
    private compileService: CompileService,
    private editorService: EditorService) {
  }

  ngOnInit(): void {
    // show common sidebar on startup if no other sidebar is selected
    this.router.events.pipe(
      filter((event) : event is NavigationEnd => event instanceof NavigationEnd),
      take(1)
    ).subscribe(() => {
      if (this.currentOutletUrl("sidebar") === null) {
        this.router.navigate([{ outlets: { sidebar: 'common' } }]);
      }
    })
  }

  currentOutletUrl(name: string) {
    const routerChildren = this.router.parseUrl(this.router.url).root.children;
    if (name in routerChildren) {
      return routerChildren[name].segments[0].path;
    }
    return null;
  }
  showSidebar(who: string | null): void {
    if (who === this.currentOutletUrl("sidebar") || who === null) {
      this.router.navigate([{
        outlets: {
          sidebar: null
        }
      }]);
    } else {
      if (this.sidebarItems.find(i => i.url === who)?.disabled) return;
      this.router.navigate([{
        outlets: {
          sidebar: who
        }
      }]);
    }
  }
  showTools(who: string | null): void {
    if (who === this.currentOutletUrl("tools") || who === null) {
      this.router.navigate([{
        outlets: {
          tools: null
        }
      }]);
    } else {
      if (this.toolsItems.find(i => i.url === who)?.disabled) return;
      this.router.navigate([{
        outlets: {
          tools: who
        }
      }]);
    }
  }
}
