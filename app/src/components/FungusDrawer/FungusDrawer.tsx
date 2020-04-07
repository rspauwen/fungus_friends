import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Divider, Drawer, FormControl, FormHelperText, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import { Fungus } from '../../model/fungus';
import FungusService from '../../services/FungusService';
import styles from './FungusDrawer.module.scss';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

export default class FungusDrawer extends React.Component
    <{ fungi, clickedLoc, addFungusCallBack, filterCallback, refreshMapCallback, searchCallBack }> {

    state = {
        open: true,
        searchedFungi: [],
        searchTerm: '',
        selectedColor: '',
        selectedSpots: '',
        addEnabled: false,
        addFungusModalOpened: false,
        addingFungus: false,
        dialogColor: '',
        dialogSpots: '',
    };

    openDrawer = () => {
        this.setState({ open: true })
    }

    closeDrawer = () => {
        this.setState({ open: false })
    }

    handleFilterColor = (e) => {
        const selectedColor = e.target.value;
        this.setState({ selectedColor: selectedColor })
        this.handleFilter(true, selectedColor);
    };

    handleFilterSpots = (e) => {
        const selectedSpots = e.target.value;
        this.setState({ selectedSpots: selectedSpots })
        this.handleFilter(false, selectedSpots);
    };

    handleFilter = (isColor: boolean, val: String) => {
        const selectedColor = isColor ? val : this.state.selectedColor;
        const selectedSpots = !isColor ? val : this.state.selectedSpots;

        this.props.fungi.forEach((f) => {
            f.isHidden = selectedColor != '' && f.color.toString() != selectedColor || selectedSpots != '' && f.spots.toString() != selectedSpots;
        });

        this.props.filterCallback(this.props.fungi);
    };

    handleClearFilters = () => {
        this.setState({ selectedColor: '', selectedSpots: '' })

        this.props.fungi.forEach((f) => {
            f.isHidden = false;
        });
        this.props.filterCallback(this.props.fungi);
    };

    handleClearSearch = () => {
        this.setState({ searchedFungi: [], searchTerm: '' })
        this.props.searchCallBack(null);
    };

    handleSearch = (e) => {
        const searchTerm = e.target.value;

        let searchedFungi = [];

        if (searchTerm != '') {
            searchedFungi = searchTerm == '*' ? this.props.fungi : this.props.fungi.filter((f) => f.name.includes(searchTerm));
        }

        this.setState({ searchedFungi: searchedFungi, searchTerm: searchTerm });
    };

    handleSearchItemClicked = (fungus: Fungus) => {
        if (!fungus.isHidden) {
            this.props.searchCallBack(fungus);
            return
        }

        const unhideDialog = ({ onClose }) => {
            const handleClickedNo = () => {
                onClose();
            }
            const handleClickedYes = () => {
                onClose();
                fungus.isHidden = false;
                this.props.searchCallBack(fungus);
            }
            return (
                <div className={styles.fungus_unhide_dialog}>
                    <h3>{`Fungus "${fungus.name}" is filtered at the moment`}</h3>
                    <p>Do you want to make it visible again?</p>
                    <div className={styles.fungus_unhide_dialog_buttons}>
                        <button onClick={handleClickedNo}>No</button>
                        <button onClick={handleClickedYes}>Yes</button>
                    </div>
                </div>
            );
        }

        confirmAlert({ customUI: unhideDialog })
    };


    handleAddFungusClicked = () => {
        this.handleClearFilters(); // fix
        this.setState({ addEnabled: true })
        this.props.addFungusCallBack(true);
    };

    handleAddFungusCloseModal = () => {
        this.setState({ addEnabled: false });
        this.props.addFungusCallBack(false);
    };

    handleAddFungusConfirmation = (e) => {
        // TODO: add proper form validations (incl. unique name)

        e.preventDefault();
        const data = new FormData(e.target);

        const lat = data.get('lat');
        const lng = data.get('lng');
        const name = data.get('name');
        const color = data.get('color');
        const spots = data.get('spots');

        if (lat == "" || lng == "" || name == "" || color == "" || spots == "") {
            toast.error("Oops, at least one of the form values is empty!");
            // TODO: set focus to first field with missing value
            return;
        }

        const loc = {
            _latitude: parseFloat(lat.toString()),
            _longitude: parseFloat(lng.toString())
        }

        const fungus = new Fungus('', name.toString(), spots.toString(), color.toString(), loc, true);

        this.setState({ addingFungus: true });

        // add fungus to our firebase
        FungusService.addFungus(fungus).then((result) => {
            this.setState({ addingFungus: false });

            if (result == true) {
                this.handleAddFungusCloseModal();
                this.props.refreshMapCallback();
            }
        });
    }

    handleChangeColor = (event: React.ChangeEvent<{ value: unknown }>) => {
        this.setState({ dialogColor: event.target.value as string });
    };

    handleChangeSpots = (event: React.ChangeEvent<{ value: unknown }>) => {
        this.setState({ dialogSpots: event.target.value as string });
    };


    render() {
        const fungi = this.props.fungi.filter((f) => !f.isHidden);

        const colors = fungi.map(f => f.color.toString()).filter((v, i, s) => s.indexOf(v) === i);
        const spots = fungi.map(f => f.spots).filter((v, i, s) => s.indexOf(v) === i);

        const hasNoFilter = this.state.selectedColor == '' && this.state.selectedSpots == '';

        const clearSearchButton = this.state.searchedFungi.length > 0 ?
            <ListItem button key="search_clear" onClick={() => { this.handleClearSearch() }}>
                <ListItemIcon>{<ClearAllIcon />}</ListItemIcon>
                <ListItemText primary="Clear search" />
            </ListItem> : null;


        const addFungusDialog = this.props.clickedLoc == null ? null : (
            <Dialog
                className={styles.fungus_add_dialog}
                open={this.props.clickedLoc != null}
                onClose={this.handleAddFungusCloseModal}
            >
                <DialogContent>
                    <DialogContentText>
                        To add a new fungus, please fill in the following fields.
                        </DialogContentText>

                    <form className={styles.fungus_add_dialog_form}
                        id="dialogForm" onSubmit={this.handleAddFungusConfirmation}>
                        <TextField value={this.props.clickedLoc?.lat} variant="filled" fullWidth
                            id="lat" name="lat" label="Latitude" InputProps={{ readOnly: true }} />
                        <TextField value={this.props.clickedLoc?.lng} variant="filled" fullWidth
                            id="lng" name="lng" label="Longitude" InputProps={{ readOnly: true }} />
                        <TextField label="Name" autoFocus id="name" name="name" fullWidth />
                        <FormControl fullWidth >
                            <InputLabel id="drawer_dialog_color_label">Color</InputLabel>
                            <Select labelId="drawer_dialog_color_label" value={this.state.dialogColor} onChange={this.handleChangeColor}
                                id="drawer_dialog_color_input" name="color" autoWidth>
                                <MenuItem value="">
                                    <em></em>
                                </MenuItem>
                                {colors.map((c) => (
                                    <MenuItem value={c} key={c}>
                                        <em>{c}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select a color</FormHelperText>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="drawer_dialog_spots_label">Spots</InputLabel>
                            <Select labelId="drawer_dialog_spots_label" value={this.state.dialogSpots} onChange={this.handleChangeSpots}
                                id="drawer_dialog_spot_input" name="spots" autoWidth>
                                <MenuItem value="">
                                    <em></em>
                                </MenuItem>
                                {spots.map((s) => (
                                    <MenuItem value={s} key={s}>
                                        <em>{s}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select type of spots</FormHelperText>
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAddFungusCloseModal} color="secondary">
                        Cancel
                    </Button>
                    <Button disabled={this.state.addingFungus} type="submit" form="dialogForm" color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        );


        const addFungusButton = !this.state.addEnabled && fungi.length > 0 ?
            <ListItem button key="add_location" onClick={() => { this.handleAddFungusClicked() }}>
                <ListItemIcon>{<AddLocationIcon />}</ListItemIcon>
                <ListItemText primary="Add fungus" />
            </ListItem> : null


        const drawerContent = (
            <div className={styles.fungus_drawer_list}>
                <List>
                    <ListItem key='fungus_drawer_counter'>
                        <ListItemIcon>{<BubbleChartIcon />}</ListItemIcon>
                        <ListItemText secondary={`Fungi on map: ${fungi.length}`} />
                    </ListItem>

                    <Divider variant="middle" />

                    <ListItem key="fungus_drawer_filter">
                        <ListItemIcon>{<FilterListIcon />}</ListItemIcon>
                        <ListItemText primary="Filters" />
                    </ListItem>
                    <div className={styles.fungus_drawer_filter} key="filter_color">
                        <FormControl fullWidth={true} variant="outlined">
                            <InputLabel id="drawer_filter_color_label">Color</InputLabel>
                            <Select
                                labelId="drawer_filter_color_label"
                                id="drawer_filter_color_input"
                                value={this.state.selectedColor}
                                onChange={this.handleFilterColor}
                                autoWidth
                            >
                                <MenuItem value="">
                                    <em>*</em>
                                </MenuItem>
                                {colors.map((c) => (
                                    <MenuItem value={c} key={c}>
                                        <em>{c}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Filter by color</FormHelperText>
                        </FormControl>
                    </div>
                    <div className={`${styles.fungus_drawer_filter}`} key="filter_spots">
                        <FormControl fullWidth={true} variant="outlined">
                            <InputLabel id="drawer_filter_spots_label">Spots</InputLabel>
                            <Select
                                labelId="drawer_filter_spots_label"
                                id="drawer_filter_spots_input"
                                value={this.state.selectedSpots}
                                onChange={this.handleFilterSpots}
                                autoWidth
                            >
                                <MenuItem value="">
                                    <em>*</em>
                                </MenuItem>

                                {spots.map((s) => (
                                    <MenuItem value={s} key={s}>
                                        <em>{s}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Filter by spots</FormHelperText>
                        </FormControl>
                    </div>
                    <ListItem button disabled={hasNoFilter} key="filter_clear" onClick={() => { this.handleClearFilters() }}>
                        <ListItemIcon>{<ClearAllIcon />}</ListItemIcon>
                        <ListItemText primary="Clear filters" />
                    </ListItem>

                    <Divider variant="middle" />

                    <ListItem key='fungus_drawer_search'>
                        <ListItemIcon>{<SearchIcon />}</ListItemIcon>
                        <ListItemText primary="Search" />
                    </ListItem>
                    <form className={styles.fungus_drawer_search} noValidate autoComplete="off">
                        <TextField value={this.state.searchTerm} label="Search by name" variant="outlined" onChange={this.handleSearch} />
                    </form>
                    {this.state.searchedFungi.map((f: Fungus, i) => (
                        <ListItem button key={`search_result_${i}`} onClick={() => this.handleSearchItemClicked(f)} >
                            <ListItemText primary={!f.isHidden ? f.name : null} secondary={f.isHidden ? f.name : null} />
                        </ListItem>
                    ))}
                    {clearSearchButton}

                    <Divider variant="middle" />
                    {addFungusButton}
                    {addFungusDialog}
                </List>
            </div>
        );


        return (
            <div>
                <React.Fragment>
                    <Drawer anchor='right'
                        classes={{ root: styles.fungus_drawer, paper: styles.fungus_drawer_paper }}
                        open={this.state.open}
                        onClose={this.closeDrawer}
                        variant="permanent"
                    // elevation={0}
                    >
                        {drawerContent}
                    </Drawer>
                </React.Fragment>
            </div >
        );
    }
}
