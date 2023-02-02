export class Constants {
  public static Format = {
    Date: {
      Long: 'dd/MM/yyyy HH:mm:ss',
      Short: 'dd/MM/yyyy',
      Day: 'EEEE, dd/MM/YYYY',
    },
  };

  public static SearchConstant = {
    PageSize: {
      5: 5,
      6: 6,
      10: 10,
      12: 12,
      15: 15,
      18: 18,
      20: 20,
    },
  };

  public static FilterDateLabelConstants = {
    dayHeader: 'Theo ngày',
    dayYesterday: 'Hôm qua',
    dayToday: 'Hôm nay',
    weekHeader: 'Theo tuần',
    weekThis: 'Tuần này',
    weekLast: 'Tuần trước',
    monthHeader: 'Theo tháng',
    monthThis: 'Tháng này',
    monthLast: 'Tháng trước',
    allHeader: 'Toàn thời gian',
    all: 'All',
  };

  public static FilterDateConstantsTime = {
    Yesterday: {
      label: Constants.FilterDateLabelConstants.dayYesterday,
      value: [
        new Date(new Date().setDate(new Date().getDate() - 1)),
        new Date(),
      ],
    },
    Today: {
      label: Constants.FilterDateLabelConstants.dayToday,
      value: [new Date(), new Date()],
    },
    WeekThis: {
      label: Constants.FilterDateLabelConstants.weekThis,
      value: [
        new Date(new Date().setDate(new Date().getDate() - 7)),
        new Date(),
      ],
    },
    WeekLast: {
      label: Constants.FilterDateLabelConstants.weekLast,
      value: [
        new Date(new Date().setDate(new Date().getDate() - 14)),
        new Date(new Date().setDate(new Date().getDate() - 7)),
      ],
    },
    MonthThis: {
      label: Constants.FilterDateLabelConstants.monthThis,
      value: [
        new Date(new Date().setDate(new Date().getDate() - 30)),
        new Date(),
      ],
    },
    MonthLast: {
      label: Constants.FilterDateLabelConstants.monthLast,
      value: [
        new Date(new Date().setDate(new Date().getDate() - 60)),
        new Date(new Date().setDate(new Date().getDate() - 30)),
      ],
    },
    All: {
      label: Constants.FilterDateLabelConstants.allHeader,
      value: Constants.FilterDateLabelConstants.all,
    },
  };

  public static FilterDateConstants = {
    dayGroup: {
      label: Constants.FilterDateLabelConstants.dayHeader,
      subGroup: [
        Constants.FilterDateConstantsTime.Yesterday,
        Constants.FilterDateConstantsTime.Today,
      ],
    },
    weekGroup: {
      label: Constants.FilterDateLabelConstants.weekHeader,
      subGroup: [
        Constants.FilterDateConstantsTime.WeekThis,
        Constants.FilterDateConstantsTime.WeekLast,
      ],
    },
    monthGroup: {
      label: Constants.FilterDateLabelConstants.monthHeader,
      subGroup: [
        Constants.FilterDateConstantsTime.MonthThis,
        Constants.FilterDateConstantsTime.MonthLast,
        Constants.FilterDateConstantsTime.All,
      ],
    },
  };

  public static Permission = {
    Function: {
      DashboardAdmin: 'DASHBOARD_ADMIN',
      DashboardProduct: 'DASHBOARD_PRODUCT_EXECUTIVE',
      Order: 'ORDER',
      Manufacturing: 'MANUFACTURING',
      Qc: 'QC',
      User: 'SYSTEM_USER',
      Customer: 'SYSTEM_CUSTOMER',
      Product: 'SYSTEM_PRODUCT',
      ProdutCategory: 'SYSTEM_PRODUCT_CATEGORY',
      Color: 'SYSTEM_COLOR',
      Price: 'SYSTEM_PRICE_BOARD',
      CancelRequest: 'CANCEL_ORDER_REQUEST',
      Deposit: 'DEPOSIT',
      Billing: 'BILLING',
    },
    Command: {
      View: 'VIEW',
      Create: 'CREATE',
      Update: 'UPDATE',
      Check: 'CHECK',
      Packaging: 'PACKAGING',
    },
  };

  public static TimeConstants = {
    Delay1s: 1000,
    Delay3s: 3000,
    Delay5s: 5000,
  };

  public static Language = ['en', 'vi'];

  public static Days = [
    {
      id: 'Monday',
      name: 'Thứ 2',
    },
    {
      id: 'Tuesday',
      name: 'Thứ 3',
    },
    {
      id: 'Wednesday',
      name: 'Thứ 4',
    },
    {
      id: 'Thursday',
      name: 'Thứ 5',
    },
    {
      id: 'Friday',
      name: 'Thứ 6',
    },
    {
      id: 'Saturday',
      name: 'Thứ 7',
    },
    {
      id: 'Sunday',
      name: 'Chủ nhật',
    },
  ];

  public static Categories = {
    teacherContractType: 'teacher_contract_type',
    teacherType: 'teacher_type',
    studentStudyPurpose: 'student_study_purpose',
    studentStudyInterest: 'student_study_interest',
    tagetClass: 'class_setup_type'

  };
}
