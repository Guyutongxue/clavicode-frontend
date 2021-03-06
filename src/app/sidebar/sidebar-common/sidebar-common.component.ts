import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActionService } from 'src/app/services/action.service';
import { EditorService } from 'src/app/services/editor.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import { DocumentSymbol, SymbolKind } from 'vscode-languageserver-protocol';

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  kind: SymbolKind,
  range: monaco.IRange
}

const iconData: Record<string, { class: string }> = {
  [SymbolKind.File]: { class: 'symbol-file' },
  [SymbolKind.Module]: { class: 'symbol-module' },
  [SymbolKind.Namespace]: { class: 'symbol-namespace' },
  [SymbolKind.Package]: { class: 'symbol-package' },
  [SymbolKind.Class]: { class: 'symbol-class' },
  [SymbolKind.Method]: { class: 'symbol-method' },
  [SymbolKind.Property]: { class: 'symbol-property' },
  [SymbolKind.Field]: { class: 'symbol-field' },
  [SymbolKind.Constructor]: { class: 'symbol-constructor' },
  [SymbolKind.Enum]: { class: 'symbol-enum' },
  [SymbolKind.Interface]: { class: 'symbol-interface' },
  [SymbolKind.Function]: { class: 'symbol-function' },
  [SymbolKind.Variable]: { class: 'symbol-variable' },
  [SymbolKind.Constant]: { class: 'symbol-constant' },
  [SymbolKind.String]: { class: 'symbol-string' },
  [SymbolKind.Number]: { class: 'symbol-numeric' },
  [SymbolKind.Boolean]: { class: 'symbol-boolean' },
  [SymbolKind.Array]: { class: 'symbol-array' },
  [SymbolKind.Object]: { class: 'symbol-object' },
  [SymbolKind.Key]: { class: 'symbol-key' },
  [SymbolKind.Null]: { class: 'symbol-null' },
  [SymbolKind.EnumMember]: { class: 'symbol-enum-member' },
  [SymbolKind.Struct]: { class: 'symbol-struct' },
  [SymbolKind.Event]: { class: 'symbol-event' },
  [SymbolKind.Operator]: { class: 'symbol-operator' },
  [SymbolKind.TypeParameter]: { class: 'symbol-type-parameter' }
};




@Component({
  selector: 'app-sidebar-common',
  templateUrl: './sidebar-common.component.html',
  styleUrls: ['./sidebar-common.component.scss']
})
export class SidebarCommonComponent implements OnInit {

  readonly interactiveCompileAction = this.actionService.actions['compile.interactive'];
  private symbols$: Observable<DocumentSymbol[]>;
  iconData = iconData;

  constructor(private editorService: EditorService, private actionService: ActionService) {
    this.symbols$ = this.editorService.editorText$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(_ => this.editorService.getSymbols())
    );
    this.symbols$.subscribe(e => {
      if (e === null) this.dataSource.setData([]);
      else this.dataSource.setData(e);
    });
  }

  private transformer = (symbol: DocumentSymbol, level: number): FlatNode => {
    return {
      expandable: !!symbol.children && symbol.children.length > 0,
      name: symbol.name,
      level: level,
      kind: symbol.kind,
      range: {
        startLineNumber: symbol.selectionRange.start.line + 1,
        startColumn: symbol.selectionRange.start.character + 1,
        endLineNumber: symbol.selectionRange.end.line + 1,
        endColumn: symbol.selectionRange.end.character + 1
      }
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new NzTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);

  ngOnInit(): void {
  }
  
  hasChild = (_: number, node: FlatNode) => node.expandable;

  selectNode(node: FlatNode) {
    this.editorService.setPosition({
      lineNumber: node.range.startLineNumber,
      column: node.range.startColumn
    });
  }

}
