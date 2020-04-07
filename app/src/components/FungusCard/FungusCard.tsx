import { Card, CardActionArea, CardActions, CardContent, IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/SearchRounded';
import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import Unsplash, { toJson } from 'unsplash-js';
import { Fungus } from '../../model/fungus';
import FungusService from '../../services/FungusService';
import styles from './FungusCard.module.scss';

export default class FungusCard extends React.Component<{ fungus: Fungus, refreshMapCallback }> {

    state = {
        fungus: this.props.fungus,
        cardImageUrls: null,
    };


    async componentDidMount() {
        const unsplash = new Unsplash({
            accessKey: process.env.UNSPLASH_ACCESS_KEY
        });

        await unsplash.photos.getRandomPhoto({ query: "fungus" })
            .then(toJson)
            .then(json => {
                this.setState({
                    cardImageUrls: json.urls
                });
            }).catch(e => {
                console.log(e);
                return e;
            });
    }


    handleDeleteFungus = (fungus: Fungus) => {
        const deleteDialog = ({ onClose }) => {
            const handleClickedNo = () => {
                onClose();
            }
            const handleClickedYes = () => {
                onClose();
                // delete custom fungus from our firebase
                FungusService.deleteFungus(fungus).then((result) => {
                    if (result == true) {
                        this.props.refreshMapCallback();
                    }
                });
            }
            return (
                <div className={styles.fungus_delete_dialog}>
                    <h3>{`Deleting fungus "${fungus.name}"`}</h3>
                    <p>Are you sure that you want to delete this fungus?</p>
                    <div className={styles.fungus_delete_dialog_buttons}>
                        <button onClick={handleClickedNo}>No</button>
                        <button onClick={handleClickedYes}>Yes</button>
                    </div>
                </div>
            );
        }

        confirmAlert({ customUI: deleteDialog })
    };


    render() {
        const fungus = this.state.fungus;

        const cardImage = this.state.cardImageUrls == null ? null :
            <div className={styles.fungus_card_image}><img src={this.state.cardImageUrls.small} alt="random fungus image" /></div>

        const searchUrl = `https://www.google.com/search?q=fungus+%22${this.state.fungus.name.replace(' ', '+')}%22`;

        const customFungusLabel = fungus.isCustom ?
            <Typography variant="body2" color="textSecondary" component="p">
                This fungus has recently been added!
            </Typography> : null;

        const removeCustomFungusButton = fungus.isCustom ?
            <IconButton aria-label="delete" color="secondary" onClick={() => { this.handleDeleteFungus(fungus) }}>
                <DeleteIcon />
            </IconButton>
            : null;

        return (
            <Card className={styles.fungus_card} elevation={0} key={`fungus_card_${fungus.name}`}>
                <CardActionArea>
                    {cardImage}
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {fungus.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" component="p">
                            Spots: {fungus.spots}<br />
                        Color: {fungus.color.toString().toLowerCase()}
                        </Typography>
                        {customFungusLabel}
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <a href={searchUrl} target="_blank">
                        <IconButton aria-label="google" color="primary">
                            <SearchIcon />
                        </IconButton>
                    </a>
                    {removeCustomFungusButton}
                </CardActions>
            </Card>
        );
    }
}