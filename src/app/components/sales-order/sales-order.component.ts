import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SaleOrder } from '../../interfaces/sale-order'; // use sale order interface
import { SalesOrderService } from '../../services/sales_order/sales-order.service'; // use sale order service
import { dateFormat, datetimeFormat } from '../../helpers/datetime_format';
import { MatTableDataSource } from '@angular/material';
import { SalesOrderConfirmationDialog } from './delete-dialog/confirmation-dialog.component';
// import { EditSaleOrderDialog } from './edit-dialog/sales-order-edit-dialog.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';
import { snackbarConfig } from '../../helpers/snackbar_config';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
  selector: "app-sales-order",
  templateUrl: "./sales-order.component.html",
  styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent implements OnInit {
	displayedColumns: string[] = [
		// "no",
        "check",
		"subject",
		"contactName",
		"status",
		"total",
		"assignedTo",
		// "description",
		"createdTime",
		"updatedTime",
		"modify",
		"delete",
	];
 	dataSource: SaleOrder[] = []; // original datasource - array of objects
	dataArray : SaleOrder[] = []; // duplicate datasource, purpose: save the original datasource for filter

	data = new MatTableDataSource(); // data displayed in the table

	statusNames: string[] = ['Created', 'Approved', 'Delivered', 'Canceled'];
    status: FormControl = new FormControl('');
    statusFromDashboard : string;

	createdTimeForm : FormGroup;
    updatedTimeForm : FormGroup;
    searchControl : FormControl = new FormControl();

    // some variables for the the snackbar (a kind of toast message)
    label: string = '';
    setAutoHide: boolean = true;
    duration: number = 1500;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    form: FormGroup;
    isShowMassDelete : boolean = false; // it used to show/hide the mass delete button

	constructor(private router: Router,
				protected salesOrderService: SalesOrderService,
				private formBuilder: FormBuilder,
				public dialog: MatDialog,
                private route: ActivatedRoute,
                public snackBar: MatSnackBar,
                private loadingService: LoadingService){
         
        // clear params (status) before get all data
        this.router.navigateByUrl('/sales_order');
        // get status passed from dashboard page
        this.route.queryParams.subscribe((params) => {
            if(params['status']){
                this.statusFromDashboard = params['status'];
                this.status = new FormControl(this.statusFromDashboard);
            }
        });
    }

	ngOnInit() {
		// get list of sales order
		this.salesOrderService
			.getSalesOrder()
			.subscribe((data) => {
				this.dataSource = data.map((value, index) => {
					value.no = index+1;
					value.createdTime = datetimeFormat(value.createdTime);
					value.updatedTime = datetimeFormat(value.updatedTime);
					return value;
				});
                this.dataArray = this.dataSource; // store the original datasource

                // filter automately
                // if status (a param) got from dashboard, then filter the datasource by the leadSrc
                if(this.statusFromDashboard != undefined)
                    this.dataSource = data.filter(value => value.status === this.statusFromDashboard);

                // assign the datasource to data displayed in the table
				this.data = new MatTableDataSource(this.dataSource);
                this.dataSource = this.dataArray; // restore the datasource
			});
		
		this.createdTimeForm = this.formBuilder.group({
			createdTimeFrom : new FormControl(),
			createdTimeTo : new FormControl(),
		});

		this.updatedTimeForm = this.formBuilder.group({
			updatedTimeFrom : new FormControl(),
			updatedTimeTo : new FormControl(),
		});

        this.form = this.formBuilder.group({
            checkArray : this.formBuilder.array([])
        });
	}

	// function to handle cancel filter sales order event
	onCancel(){
        // get list of sales order
		this.salesOrderService
            .getSalesOrder()
            .subscribe((data) => {
                this.dataSource = data.map((value, index) => {
                    value.no = index+1;
                    value.createdTime = datetimeFormat(value.createdTime);
                    value.updatedTime = datetimeFormat(value.updatedTime);
                    return value;
                });
                this.dataArray = this.dataSource; // store the original datasource

                // assign the datasource to data displayed in the table
                this.data = new MatTableDataSource(this.dataSource);
            });
        
        // reset form controls
        this.status = new FormControl();
        this.createdTimeForm = this.formBuilder.group({
            createdTimeFrom : new FormControl(),
            createdTimeTo : new FormControl(),
        });

        this.updatedTimeForm = this.formBuilder.group({
            updatedTimeFrom : new FormControl(),
            updatedTimeTo : new FormControl(),
        });
    }

	// navigate to the edit sale order page
	navigateToEdit(saleOrderId: string) {
		let navigationExtras: NavigationExtras = {
			queryParams: { id: saleOrderId },
		};
		this.router.navigate(["/sales_order/edit"], navigationExtras);
	}
    
	applySelectFilter(filterValue: string){
        this.dataSource =  this.dataSource.filter(value => value.status === filterValue);
        
        this.data = new MatTableDataSource(this.dataSource);
        this.dataSource = this.dataArray;
    }

	applyDateFilter(form: FormGroup, filter: string){

        if(filter === 'createdTime'){
            // format date and convert it to date object
            let fromDate = new Date(dateFormat(form.value.createdTimeFrom)),
            toDate = new Date(dateFormat(form.value.createdTimeTo));

            this.dataSource = this.dataSource.filter((value) => { 
                // get date from createdTime and convert it to date object
                let createdTime = new Date(value.createdTime.substring(0, value.createdTime.indexOf(', ')));
                return createdTime >= fromDate && createdTime <= toDate;
            });
        }

        if(filter === 'updatedTime'){
            let fromDate = new Date(dateFormat(form.value.updatedTimeFrom)),
            toDate = new Date(dateFormat(form.value.updatedTimeTo));

            this.dataSource = this.dataSource.filter((value) => { 
                let updatedTime = new Date(value.updatedTime.substring(0, value.updatedTime.indexOf(', ')));
                return updatedTime >= fromDate && updatedTime <= toDate;
            });
        }

        this.data = new MatTableDataSource(this.dataSource);
        this.dataSource = this.dataArray;
    }

	applySearch(form: FormControl){
        let contactName = form.value;
        let result : SaleOrder[] = [];
        for(let i = 0; i < this.dataSource.length; i++){
            if(this.dataSource[i].contactName === contactName){
                result.push(this.dataSource[i]);
            }
        }

        this.data = new MatTableDataSource(result);
    }

	clearSearch(){
        this.data = new MatTableDataSource(this.dataArray);
        this.searchControl = new FormControl('');
    }

    onDelete(saleOrderId: string, sub: string) {
        // show confirmation dialog before detele an item
        let dialogRef = this.dialog.open(SalesOrderConfirmationDialog, { disableClose : false });
        dialogRef.componentInstance.confirmMess = `You want to delete the "${sub}"?`;
        dialogRef.afterClosed().subscribe(
            (result) => {
                if(result){
                    this.loadingService.showLoading();
                    // do confirmation action: delete the sales order
                    this.salesOrderService
                    	.deleteSaleOrder(saleOrderId)
                    	.subscribe((res) => {
                            this.loadingService.hideLoading();
                    		if(res['status'] == 1){ // status = 1 => OK
                                // show successful message
                                // display the snackbar belong with the indicator
                                let config = snackbarConfig(this.verticalPosition, this.horizontalPosition, this.setAutoHide, this.duration, ['success']);
                                this.snackBar.open('Success to delete the sale order!', this.label, config);
                    			location.reload(); // reload the sales order page
                            }
                            else {
                                // show error message
                                let config = snackbarConfig(this.verticalPosition, this.horizontalPosition, this.setAutoHide, this.duration, ['failed']);
                                this.snackBar.open('Failed to delete the sale order!', this.label, config);
                            }
                    	});
                }
                else{
                    dialogRef = null;
                }
            }
        );
	}

    onCheckboxClicked(e){
        this.isShowMassDelete = true;
        const checkArray: FormArray = this.form.get('checkArray') as FormArray;

        if(e.target.checked){
            checkArray.push(new FormControl(e.target.value));
        }
        else {
            let i : number = 0;
            checkArray.controls.forEach((item: FormControl) => {
                if(item.value == e.target.value){
                    checkArray.removeAt(i);
                    return;
                }
                i++;
            })
        }

        if(checkArray.length == 0){
            this.isShowMassDelete = false;
        }
    }

    onMassDeleteBtnClicked(){
        const salesOrderIds = this.form.value;
        // show confirmation dialog before detele an item
        let dialogRef = this.dialog.open(SalesOrderConfirmationDialog, { disableClose : false });
        dialogRef.componentInstance.confirmMess = `You want to delete the contacts?`;
        dialogRef.afterClosed().subscribe(
            (result) => {
                this.loadingService.showLoading();
                if(result){
                    // do confirmation action: delete the contact
                    this.salesOrderService
                        .deleteSalesOrder(salesOrderIds)
                        .subscribe((res) => {
                            this.loadingService.hideLoading();
                            if(res['status'] == 1){ // status = 1 => OK
                                // show successful message
                                // display the snackbar belong with the indicator
                                let config = snackbarConfig(this.verticalPosition, this.horizontalPosition, this.setAutoHide, this.duration, ['success']);
                                this.snackBar.open('Success to delete the sales order!', this.label, config);
                                window.location.reload(); // reload contacts page
                            }
                            else {
                                // show error message
                                let config = snackbarConfig(this.verticalPosition, this.horizontalPosition, this.setAutoHide, this.duration, ['failed']);
                                this.snackBar.open('Failed to delete the sales order!', this.label, config);
                            }
                        });
                }
                else{
                    dialogRef = null;
                }
            }
        )
    }

    // onClickedRow(row : SaleOrder){
    //     let dialogRef = this.dialog.open(EditSaleOrderDialog, { disableClose : false, panelClass: 'formDialog' });
    //     dialogRef.componentInstance.saleOrderId = row._id;
    //     dialogRef.afterClosed().subscribe(
    //         (result) => {
    //             if(result){
    //                 window.location.reload();
    //             }
    //             else {
    //                 dialogRef = null;
    //             }
    //         }
    //     );
    // }
}
