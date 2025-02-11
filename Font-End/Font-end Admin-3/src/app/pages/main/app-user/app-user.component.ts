

import { Component, Injector, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/base-component';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, NgForm } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FilterType, PagingRequest } from '../../../shared/models/PagingRequest';
import { PagedResult } from '../../../shared/models/PageResult';
import { catchError, map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { B00AppUser } from '../../../shared/models/B00AppUser';
import { GroupData } from '../../../shared/models/GroupData';

import { css } from 'jquery';
import { stringify } from 'querystring';
import { B10Employee } from 'src/app/shared/models/B10Employee';
import { B00permissionFunc } from 'src/app/shared/models/B00permissionFunc';
import { vB00PermissionData } from 'src/app/shared/models/vB00PermissionData';
interface FilterTypeColumn { value: string, viewValue: string }
interface FilterTypeValue { value: FilterType, viewValue: string }
@Component({
  selector: 'app-app-user',
  templateUrl: './app-user.component.html',
  styleUrls: ['./app-user.component.css']
})
export class AppUserComponent extends BaseComponent implements OnInit {
  //exploredata
  public tintuc: any;
  public page = 1;
  public pageSize = 20;
  public totalItems: any;
  public filter: PagingRequest;
  public listItem: PagedResult<B00AppUser>;
  public checkFilter: boolean;
  public ClickColumn: string = '';
  public api: string = '/api/app-user';
  public groupData: GroupData;
  public selectGroup: any;
  public selectItem: B00AppUser;
  public filterTypeColumn: any;
  public filterTypeValue: any;
  public displayFormGroup: boolean = false;
  public dataGroup: B00AppUser;
  public formData = new FormData();
  public addType: number = 0; //thao tác lưu dữ liệu vd 0: lưu và thêm mới
  public lookupRows: number = 10;
  public lookupData: B10Employee;
  public permissionData: Array<vB00PermissionData>;
  public permissionFunction: B00permissionFunc;

  //editordata
  public displayUpdate: boolean = false;
  public displayConvert: boolean = false;// chuyển nhóm dữ liệu
  displayAdd: boolean = false;
  displayPermission: boolean = false;
  constructor(private fb: FormBuilder, private httpclient: HttpClient, injector: Injector, private route: ActivatedRoute, private router: Router) {
    super(injector);
    this.filter = new PagingRequest();
    this.listItem = new PagedResult<B00AppUser>();
    this.groupData = new GroupData();
    this.selectItem = new B00AppUser();
  }

  ngOnInit(): void {
    this.filter.PageIndex = this.page;
    this.filter.PageSize = this.pageSize;
    this.filter.DataIsActive = true;
    this.Filter(this.filter);
    this.ShowViewDataGroup();

  }
  //start //explore

  InitValueFormFilter(value: string = null) {
    if (value) {
      this.filter.FilterValue = value;
    }
    this.filterTypeColumn = [{ value: `${this.filter.FilterColumn}`, viewValue: `Cột hiện thời "${this.filter.FilterColumn}"` }, { value: '*', viewValue: 'Tất cả các cột' }];
    if (this.filter.FilterValue) {
      this.filterTypeValue = [
        { value: FilterType.Contains, viewValue: `Chứa nội dung "${this.filter.FilterValue}"` }
        , { value: FilterType.StartsWith, viewValue: `Nội dung bắt đầu với "${this.filter.FilterValue}"` }
        , { value: FilterType.EndsWith, viewValue: `Nội dung kết thúc với "${this.filter.FilterValue}"` }
        , { value: FilterType.Equals, viewValue: `Nội dung tương tự "${this.filter.FilterValue}"` }
        , { value: FilterType.NotEmpty, viewValue: `Nội dung khác rỗng "${this.filter.FilterValue}"` }
        , { value: FilterType.Empty, viewValue: `Nội dung rỗng "${this.filter.FilterValue}"` }
      ];
      if (Number(this.filter.FilterValue)) {
        // add value filer
        this.filterTypeValue.push({ value: FilterType.GreaterThan, viewValue: `Lớn hơn "${this.filter.FilterValue}"` });
        this.filterTypeValue.push({ value: FilterType.LessThan, viewValue: `Nhỏ hơn "${this.filter.FilterValue}"` });
        this.filterTypeValue.push({ value: FilterType.Equals, viewValue: `Bằng "${this.filter.FilterValue}"` });
      }
    }
    else {
      this.filterTypeValue = [
        { value: FilterType.NotEmpty, viewValue: `Nội dung khác rỗng ` }
        , { value: FilterType.Empty, viewValue: `Nội dung rỗng ` }
      ];
    }
  }

  Filter(PagingRequest: PagingRequest) {
    let orderBy = PagingRequest.OrderBy;
    this.route.params.subscribe(params => {
      this._api.post(`${this.api}/filter`, { pageIndex: PagingRequest.PageIndex, pageSize: PagingRequest.PageSize, orderBy: PagingRequest.OrderBy, orderDesc: PagingRequest.OrderDesc, filterColumn: PagingRequest.FilterColumn, filterType: PagingRequest.FilterType, filterValue: PagingRequest.FilterValue, ParentId: PagingRequest.ParentId, dataIsActive: PagingRequest.DataIsActive }).takeUntil(this.unsubscribe).subscribe(res => {
        this.listItem.PageIndex = res.pageIndex ? res.pageIndex : 1;
        this.listItem.PageSize = res.pageSize ? res.pageSize : this.pageSize;
        this.listItem.PageCount = res.pageCount;
        this.listItem.TotalRecords = res.totalRecords;
        this.listItem.Items = res.items;
        setTimeout(() => {
          this.loadScripts();
        });
      }, err => { console.log(err) });
    });
  }
  OrderBy(column: string) {
    this.filter.OrderBy = column;
    this.filter.OrderDesc = !this.filter.OrderDesc;
    this.Filter(this.filter);
  }
  loadPage(page) {
    this.filter.PageIndex = page;
    this.Filter(this.filter);
  }
  ChangeColorColumnIsClick(column: string) {
    if (column == this.filter.FilterColumn) {
      document.getElementById(this.filter.FilterColumn).style.backgroundColor = '#f8f9fa';
      this.filter.FilterColumn = null;
      return;
    }
    else if (!this.ClickColumn) {
      this.ClickColumn = column;
    }
    else if (this.filter.FilterColumn != column) {
      if (this.filter.FilterColumn == '*') {
        document.getElementById(this.ClickColumn).style.backgroundColor = '#f8f9fa';
      }
      else if (this.filter.FilterColumn) {
        document.getElementById(this.filter.FilterColumn).style.backgroundColor = '#f8f9fa';
      }
    }
    this.filter.FilterColumn = column;
    document.getElementById(column).style.backgroundColor = 'aqua';
    this.InitValueFormFilter();
  }
  NotGroup() {
    this.selectGroup = null;
    this.filter.ParentId = 0;
    this.filter.DataIsActive = true;
    this.Filter(this.filter);
  }
  IsActive() {
    this.filter.ParentId = 0;
    this.filter.DataIsActive = false;
    this.Filter(this.filter);
  }
  search(form: NgForm) {
    console.log(this.filter);
    this.Filter(this.filter);
  }
  ShowGroup() {
    this.displayAdd = true;
  }
  ShowViewDataGroup() {
    this._api.get(`${this.api}/group`).takeUntil(this.unsubscribe).subscribe(res => {
      this.groupData = res;
    });
  }
  nodeSelect(event?, item?: any) {
    this.filter.DataIsActive = true;
    if (item != undefined) {
      if (item.isGroup == true) {
        this.filter.ParentId = item.id;
        this.Filter(this.filter);
      }
    }
    else {
      this.filter.ParentId = event.node.data;
      this.Filter(this.filter);
      return;
    }
  }
  //end  //explore

  /// DataEditor

  showAdd() {
    this.displayAdd = true;
    this.displayEditChild = true;
  }
  showEdit(item: any) {
    debugger;
    this.selectItem = item;
    this.displayUpdate = true;
    console.log(this.selectItem);
    if (item.isGroup == true) {
      this.displayEditGroup = true;
      this.displayEditChild = false;
    }
    else {
      this.displayEditGroup = false;
      this.displayEditChild = true;
    }

  }
  displayEditGroup: boolean = false;
  showAddGroup() {
    this.displayEditGroup = true;
    this.displayEditChild = false;
  }
  displayEditChild: boolean = false;
  showAddChild() {
    this.displayEditGroup = false;
    this.displayEditChild = true;
  }

  SelectForeignKey(event: any, foreignKey: string) {
    this.formData.append(foreignKey, event.code);
  }
  SelectFile(event: any, name: string, isMultiple: boolean) {
    if (isMultiple) {
      event.target.files.forEach(element => {
        this.formData.append(name, element);
      });
    }
    else {
      this.formData.append(name, event.target.files[0]);
    }
  }
  //data editor
  Add(form: NgForm, addDataIsGroup: boolean, addType: number) {

    if (addDataIsGroup) {
      if (this.selectGroup) {
        this.formData.append('ParentId', `${this.selectGroup.Data}`);
      }
      else { this.formData.append('ParentId', `-1`); }
      this.formData.append('IsGroup', `${true}`);
    }
    // let obj:B00AppUser;
    // this.ConvertNgFormToObject(form,obj);
    this._api.post(`${this.api}/add`, form.value).takeUntil(this.unsubscribe).subscribe(res => {
      alert(res.messages[0].message)
      this.formData = new FormData();
      this.Filter(this.filter);
    });
    if (addType == 0) {
      form.resetForm();
    }
    else if (addType == 1) {
      form.control['code'].setValue('');
    }
    else {
      form.resetForm();
      this.displayAdd = false;
    }
  }

  Update(form: NgForm, addType: number) {
    this.ConvertObjectToFormData(this.selectItem, this.formData);
    this._api.putFormData(`${this.api}/update`, this.formData).takeUntil(this.unsubscribe).subscribe(res => {
      this.Filter(this.filter);
      this.formData = new FormData();
      alert(res.messages[0].message)
    });
    if (addType == 0) {
      form.resetForm();
    }
    else if (addType == 1) {
      if (form.control['code']) { form.control['code'].setValue(''); }
    }
    else {
      form.resetForm();
      this.displayUpdate = false;
    }
  }
  ConvertGroupToGroup(event: any) {
    this.selectGroup = event;
  }
  Transfer() {
    this.selectItem.parentId = this.selectGroup.node.data;

    this._api.put(`${this.api}/transfer`, this.selectItem).takeUntil(this.unsubscribe).subscribe(res => {
      this.Filter(this.filter);
      alert(res.messages[0].message)
      this.displayConvert = false;
    });
  }
  Delete(id: number) {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      this._api.deleteParamUrl(`${this.api}`, id).takeUntil(this.unsubscribe).subscribe(res => {
        this.Filter(this.filter);
        alert(res.messages[0].message)
      });
    }
  }

  Lookup(str: any) {
    this._api.getLookup(`employee`, str.query).takeUntil(this.unsubscribe).subscribe(res => {
      this.lookupData = res;
    });
  }

  Restore(id: number) {
    if (confirm("Bạn có chắc chắn muốn khôi phục?")) {
      this._api.putParamUrl(`${this.api}/restore`, id).takeUntil(this.unsubscribe).subscribe(res => {
        this.Filter(this.filter);
        alert(res.messages[0].message)
      });
    }
    //end data editor
  }

  //Permission
  _AccessApplication: boolean;
  _Category: boolean;
  _Receipt: boolean;
  _General: boolean;
  _Report: boolean;
  _System: boolean;
  permission(id: number) {
    debugger;
    this._api.get('/api/permission/' + id).takeUntil(this.unsubscribe).subscribe(res => {
      this.permissionFunction = res.func;
      this.permissionData = res.data;
      this._AccessApplication = this.permissionFunction._AccessApplication;
      this._Category = this.permissionFunction._Category;
      this._Receipt = this.permissionFunction._Receipt;
      this._General = this.permissionFunction._General;
      this._Report = this.permissionFunction._Report;
      this._System = this.permissionFunction._System;
      // console.log(this.permissionFunction);
      // console.log(this.selectItem);
    });
  }
  changePermissionData(id: number, event: any, column: any) {
    this.permissionData[id]["UserId"] = this.selectItem.id;
    this.permissionData[id][column] = event.target.checked;
    console.log(this.permissionData[id]);
    // alert(this.permissionData[id][column] );
  }
  changePermissionFunction(event: any, column: any) {
    this.permissionFunction[column] = event.target.checked;
  }
  updatePermission(form: NgForm, addType: number) {
    debugger;
    console.log(this.permissionFunction);
    this.selectItem.PermissionData = this.permissionData;
    this.ConvertObjectToFormData(this.selectItem, this.formData);
    this.formData.append('permissionData1', JSON.stringify(this.permissionData));
    this.formData.append('permissionFunction1', JSON.stringify(this.permissionFunction));
    // this.selectItem.
    this._api.postFormData(`/api/permission/update`, this.formData).takeUntil(this.unsubscribe).subscribe(res => { });

  }
}
