import { Button, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import React from 'react';
import { toast } from 'react-toastify';
import { Fungus } from '../../model/fungus';
import FungusService from '../../services/FungusService';
import styles from './FungusDialog.module.scss';

export default class FungusDialog extends React.Component<{ mapState, closeDialogCallback, refreshMapCallback }> {

    state = {
        addingFungus: false,
        name: this.props.mapState.clickedFungus?.name ?? '',
        lat: this.props.mapState.clickedFungus?.latlng.lat ?? '',
        lng: this.props.mapState.clickedFungus?.latlng.lng ?? '',
        color: this.props.mapState.clickedFungus?.color ?? '',
        spots: this.props.mapState.clickedFungus?.spots ?? '',
    };

    closeDialog = () => {
        this.props.closeDialogCallback();
    };

    handleSubmitDialog = (e, isAddMode) => {
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

        if (isAddMode) {
            // add fungus to our firebase
            FungusService.addFungus(fungus).then((added) => {
                this.setState({ addingFungus: false });

                if (added) {
                    toast.success(`Fungus "${fungus.name}" has been added!`);
                    this.closeDialog();
                    this.props.refreshMapCallback();
                } else {
                    toast.error("Oops, failed to add fungus!");
                }
            });
        } else {
            // edit existing fungus
            fungus.id = this.props.mapState.clickedFungus.id;

            FungusService.editFungus(fungus).then((edited) => {
                this.setState({ addingFungus: false });

                if (edited == true) {
                    toast.success(`Fungus "${fungus.name}" has been edited!`);
                    this.closeDialog();
                    this.props.refreshMapCallback();
                } else {
                    toast.error("Oops, failed to edit fungus!");
                }
            });
        }
    }

    onChangeColor = (event: React.ChangeEvent<{ value: unknown }>) => {
        this.setState({ color: event.target.value as string });
    };

    onChangeSpots = (event: React.ChangeEvent<{ value: unknown }>) => {
        this.setState({ spots: event.target.value as string });
    };


    render() {
        const clickedFungus = this.props.mapState.clickedFungus as Fungus;

        const isAddMode = clickedFungus == null;

        const dialogText = isAddMode ? 'To add a new fungus, please fill in the following fields' :
            `Editing fungus '${clickedFungus.name}' attributes`;

        const clickedLoc = isAddMode ? this.props.mapState.clickedLoc : clickedFungus.latlng;

        return (
            <Dialog
                className={isAddMode ? styles.fungus_add_dialog : styles.fungus_edit_dialog}
                open={isAddMode ? clickedLoc != null : clickedFungus != null}
                onClose={this.closeDialog}
            >
                <DialogContent>
                    <DialogContentText>
                        {dialogText}
                    </DialogContentText>

                    <form className={styles.fungus_add_dialog_form}
                        id="dialogForm" onSubmit={(e) => this.handleSubmitDialog(e, isAddMode)}>
                        <TextField id="lat" name="lat" label="Latitude"
                            InputProps={{ readOnly: isAddMode }} onChange={e => this.setState({ lat: e.target.value })}
                            value={isAddMode ? clickedLoc.lat : this.state.lat} variant={isAddMode ? "filled" : "standard"} fullWidth />
                        <TextField id="lng" name="lng" label="Longitude"
                            InputProps={{ readOnly: isAddMode }} onChange={e => this.setState({ lng: e.target.value })}
                            value={isAddMode ? clickedLoc.lng : this.state.lng} variant={isAddMode ? "filled" : "standard"} fullWidth />
                        <TextField label="Name" id="name" name="name" value={this.state.name}
                            onChange={e => this.setState({ name: e.target.value })} autoFocus={isAddMode} fullWidth />
                        <FormControl fullWidth >
                            <InputLabel id="drawer_dialog_color_label">Color</InputLabel>
                            <Select labelId="drawer_dialog_color_label" id="drawer_dialog_color_input" name="color"
                                value={this.state.color} onChange={this.onChangeColor} autoWidth>
                                <MenuItem value="">
                                    <em></em>
                                </MenuItem>
                                {this.props.mapState.colors.map((c) => (
                                    <MenuItem value={c} key={c}>
                                        <em>{c}</em>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select a color</FormHelperText>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="drawer_dialog_spots_label">Spots</InputLabel>
                            <Select labelId="drawer_dialog_spots_label" id="drawer_dialog_spot_input" name="spots"
                                value={this.state.spots} onChange={this.onChangeSpots} autoWidth>
                                <MenuItem value="">
                                    <em></em>
                                </MenuItem>
                                {this.props.mapState.spots.map((s) => (
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
                    <Button onClick={this.closeDialog} color="secondary">
                        Cancel
                </Button>
                    <Button disabled={this.state.addingFungus} type="submit" form="dialogForm" color="primary">
                        Confirm
                </Button>
                </DialogActions>
            </Dialog>
        );
    }
}