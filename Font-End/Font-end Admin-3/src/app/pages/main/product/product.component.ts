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
import { vB10Product} from '../../../shared/models/B10Product';
import { B10ProductCategory } from '../../../shared/models/B10ProductCategory';
import { B10ProductCategoryInf } from '../../../shared/models/B10ProductCategoryInf';
import { GroupData } from '../../../shared/models/GroupData';

import { css } from 'jquery';
import { stringify } from 'querystring';
import { B10ProductInformation } from 'src/app/shared/models/B10ProductInformation';
interface FilterTypeColumn { value: string, viewValue: string }
interface FilterTypeValue { value: FilterType, viewValue: string }
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent extends BaseComponent implements OnInit {
  //exploredata
  public tintuc: any;
  public page = 1;
  public pageSize = 20;
  public totalItems: any;
  public filter: PagingRequest;
  public listItem: PagedResult<vB10Product>;
  public checkFilter: boolean;
  public ClickColumn: string = '';
  public api: string = '/api/product';
  public groupData: GroupData;
  public selectGroup: any;
  public selectItem: vB10Product;
  public filterTypeColumn: any;
  public filterTypeValue: any;
  public displayFormGroup: boolean = false;
  public dataGroup: vB10Product;
  public formData = new FormData();
  public addType: number = 0; //thao tác lưu dữ liệu vd 0: lưu và thêm mới
  public lookupRows: number = 10;
  public lookupProductCategoryData: B10ProductCategory;
  //editordata
  public displayUpdate: boolean = false;
  public displayConvert: boolean = false;// chuyển nhóm dữ liệu
  displayAdd: boolean = false;
  constructor(private fb: FormBuilder, private httpclient: HttpClient, injector: Injector, private route: ActivatedRoute, private router: Router) {
    super(injector);
    this.filter = new PagingRequest();
    this.listItem = new PagedResult<vB10Product>();
    this.groupData = new GroupData();
    this.selectItem = new vB10Product();
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
    debugger;
    let orderBy = PagingRequest.OrderBy;
    this.route.params.subscribe(params => {
      this._api.post(`${this.api}/filter`, { pageIndex: PagingRequest.PageIndex, pageSize: PagingRequest.PageSize, orderBy: PagingRequest.OrderBy, orderDesc: PagingRequest.OrderDesc, filterColumn: PagingRequest.FilterColumn, filterType: PagingRequest.FilterType, filterValue: PagingRequest.FilterValue, ParentId: PagingRequest.ParentId, dataIsActive: PagingRequest.DataIsActive }).takeUntil(this.unsubscribe).subscribe(res => {
        this.listItem.PageIndex = res.pageIndex?res.pageIndex:1;
        this.listItem.PageSize = res.pageSize?  res.pageSize:10;
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
    this.displayEditGroup=false;
  }
  showEdit(item: any) {
    this.selectItem = item;
    this.displayUpdate = true;
   this.GetById(item.id)
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

  SelectForeignKey(event:any,foreignKey: string)
  {
    this.formData.append(foreignKey, event.code);
    this.LookupInfo(event.code);
  }
  //grid
  fieldArray: Array<any> = [];
  newAttribute: any = {};
  newAttributeChild: any = {};
  addFieldValue() {
      this.fieldArray.push(this.newAttribute)
      this.newAttribute = {};
  }
  deleteFieldValue(index) {
    this.fieldArray.splice(index, 1);
  }
  //end grid

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
        this.formData.append('ParentId', `${this.selectGroup.data}`);
      }
      else { this.formData.append('ParentId', `-1`); }
      this.formData.append('IsGroup', `${true}`);
    }
    else
    {
      if (this.selectGroup) {
        this.formData.append('parentId', `${this.selectGroup.data}`);
      }
    }
  
    this.formData.append('ProductInformation_Json', JSON.stringify(this.fieldArray));
    this.ConvertNgFormToFormData(form,this.formData);
    
    this._api.postFormData(`${this.api}/add`, this.formData).takeUntil(this.unsubscribe).subscribe(res => {
      alert(res.messages[0].message)
      this.formData = new FormData();
      this.Filter(this.filter);
    });
    if (addType == 0) {
      form.resetForm();
      this.fieldArray=[];
    }
    else if (addType == 1) {
      form.control['code'].setValue('');
    }
    else {
      form.resetForm();
      this.displayAdd = false;
      this.fieldArray=[];
    }
  }

  Update(form: NgForm, addType: number) {
    
    this.selectItem.b10ProductInformation_Json = this.fieldArray;
    this.formData.append('ProductInformation_Json', JSON.stringify(this.fieldArray));
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
      if( form.control['code'])
        {form.control['code'].setValue('');}
       
    }
    else {
      form.resetForm();
      this.displayUpdate = false;
      this.fieldArray=[];
    }
  }
  ConvertGroupToGroup(event: any) {
    this.selectGroup = event;
  }
  Transfer() {
    this.selectItem.parentId = this.selectGroup.node.data;
debugger;
    this._api.put(`${this.api}/tranfer`, this.selectItem).takeUntil(this.unsubscribe).subscribe(res => {
      this.Filter(this.filter);
      alert(res.messages[0].message)
      this.displayConvert = false;
    });
  }
  Delete(id: number) {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      this._api.deleteParamUrl(`${this.api}`,id).takeUntil(this.unsubscribe).subscribe(res => {
        this.Filter(this.filter);
        alert(res.messages[0].message)
      });
    }
  }
  GetById(id: number) {   
 
      this._api.get(`${this.api}/${id}`,).takeUntil(this.unsubscribe).subscribe(res => {
        this.selectItem =res;
        this.selectItem.b10ProductInformation_Json=res.b10ProductInformation_Json;
        this.selectItem.b10ProductImg_Json=res.b10ProductImg_Json;
        this.fieldArray = this.selectItem.b10ProductInformation_Json;
       //check fieldarray is null
       if(this.fieldArray==null)
       {
         this.fieldArray= [];;
       }
      });    
  }


  Restore(id: number) {
    if (confirm("Bạn có chắc chắn muốn khôi phục?")) {
      this._api.putParamUrl(`${this.api}/restore`, id).takeUntil(this.unsubscribe).subscribe(res => {
        this.Filter(this.filter);
        alert(res.messages[0].message)
      });
    }
    
  }

  LookupCategory(str: any) {
    this._api.getLookup(`product-category`,str.query).takeUntil(this.unsubscribe).subscribe(res => {
      this.lookupProductCategoryData = res;
    });
  }
  lookupManufacturer:any;
  LookupManufacturer(str: any) {
    this._api.getLookup(`manufacturer`,str.query).takeUntil(this.unsubscribe).subscribe(res => {
      this.lookupManufacturer = res;
    });
  }
  LookupInfo(str: any) {   
    this._api.get(`${this.api}/look-up-product-info?v=${str}`,).takeUntil(this.unsubscribe).subscribe(res => {
      this.fieldArray=[];
     
      res.forEach(element => {
       
        if(element.description)
        {
          console.log(element.description);
          this.fieldArray.push({name:element.name,description:element.description});
        }
        else
        {
          this.fieldArray.push({name:element.name,description:` `});
        }          
      });
    });
  }
  
  //end data editor

}
