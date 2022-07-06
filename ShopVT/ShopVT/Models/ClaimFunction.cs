using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopVT.Model
{
    public static class ClaimFunction
    {

        public const string CHAT = "CHAT";
        public const string ADMINACCOUNT = "ADMINACCOUNT";
        public const string CONTACT = "CONTACT";
        public const string FUNCTION = "FUNCTION";
        public const string POST = "POST";
        public const string POSTCATEGORY = "POSTCATEGORY";
        public const string PRODUCT = "PRODUCT";
        public const string PRODUCTCATEGORY = "PRODUCTCATEGORY";
        public const string PRODUCTINFORMATION = "PRODUCTINFORMATION";
        public const string CUSTOMER = "CUSTOMER";
        public const string CUSTOMERADDRESS = "CUSTOMERADDRESS";
        public const string CUSTOMERACCOUNT = "CUSTOMERADDRESS";
        public const string EMPLOYEE = "EMPLOYEE";
        public const string SLIDE = "EMPLOYEE";
        public const string HOMEPAGE = "HOMEPAGE";
        public const string ORDER = "HOMEPAGE";
        //**************************************************//


    }
    /*
    * Nếu đặt giá trị permission theo tăng từ 1,2,3... thì sau này muốn chèn thêm permission vào giữa k được => phải đẩy ra cuối => loạn
    * 
    * Quy tắc đặt giá trị cho value: dd.dd.dd.dd.dd.dd
    * 10 chữ số = 5 level * 2 chữ số mỗi level
    * => api tối đa 5 level, mỗi level tối đa 99 giá trị
    * => đủ đáp ứng số lượng api endpoint
    * 
    * Ví dụ: 
    * 
    * api                          | permission                    | permission value
    * _____________________________|_______________________________|____________________
    * authorization                | Authorization                 | 01.00.00.00.00
    * authorization/role           | Authorization_Role            | 01.01.00.00.00
    * GET:authorization/role       | Authorization_Role_Get        | 01.01.01.00.00
    * POST:authorization/role      | Authorization_Role_Add        | 01.01.02.00.00
    * authorization/permission     | Authorization_Permission      | 01.02.00.00.00
    * 
   */
  
}
