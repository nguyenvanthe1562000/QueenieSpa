﻿using System;
using System.Collections.Generic;
namespace Model.Model
{
     public class B10ManufacturerModel 
     {
        
    public int Id { set; get; }
    public bool IsGroup { set; get; }
    public int ParentId { set; get; }
    public string Code { set; get; }
    public string Name { set; get; }
    public bool IsActive { set; get; }
    public int CreatedBy { set; get; }
    public DateTime CreatedAt { set; get; }
    public int ModifiedBy { set; get; }
    public DateTime ModifiedAt { set; get; }
    

     }
}



