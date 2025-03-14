import { eq } from 'drizzle-orm'
import { RequestHandler } from 'express'
import { db } from '../db/db'
import * as schema from '../db/schema'
import { SlugMiddleware } from '../middleware/slug'
import type { Track } from '../models'

export class TrackController {


    static Create: RequestHandler = async (req, res, next) => {

        const slug = await SlugMiddleware.checkduplicatedFromTrack(req.body.slug)
                if(slug){
                    res.status(403).send({
                        message: `Slug Track already exist`
                    });
                    return;
        }
                const result = await db
                    .insert(schema.tracks)
                    .values({
                        title: req.body.title,
                        slug: req.body.slug,
                        duration: req.body.duration
                    })
                    .$returningId()
            
                const createdTrack = result[0]
            
                if (!createdTrack) {
                    res.status(400).send({
                        message: "Error while creating Track!"
                      });
                      return;
                }
                res.status(200).send({
                    message: "Successfuly created Track",
                    data: createdTrack as Track
                  });
        }
    
    static  FindTrackById: RequestHandler<{id: number}> = async (req, res, next) => {
         const result = await db.query.tracks.findFirst({
                where: eq(schema.tracks.id, req.params.id),
            })
        
            if (!result) {
                res.status(400).send({
                    message: `No collection found with id ${req.params.id}.`
                  });
                  return;
            }
        
            const trackById: Track = { ...result } as Track
        
            // track.artists = res.trackArtists.map((a: TrackArtist) => a.artist as Artist)
        
            // // track.collections = res.trackCollections.map(
            // //     (tc) => tc.collection as Collection
            // // )
        
            // delete track.trackArtists
            // delete track.trackCollections
    
            res.status(200).send(trackById);
    }

    static FindTracksByArtistId: RequestHandler<{artistId: number}> = async (req, res, next) => {
        const tracksByArtist = await db.query.tracks.findMany({
                 where: eq(schema.trackArtists.artistId, req.params.artistId),
             })
             if (!tracksByArtist) {
                res.status(400).send({
                    message: `No Track  found with Artistid ${req.params.artistId}.`
                  });
                  return;
             }
             res.status(200).send({
                data: tracksByArtist as Track[], 
                message: "Succesffuly get tracksByArtist"});
    }

    static  FindTracksByCollectionId: RequestHandler<{collectionId: number}> = async (req, res, next) => {
         const tracksOnCollection = await db.query.tracks.findMany({
                where: eq(schema.trackCollections.collectionId, req.params.collectionId),
            })
            if (!tracksOnCollection) {
                res.status(400).send({
                    message: `No Track  found with Artistid ${req.body.artistId}.`
                  });
                  return;
            }
            res.status(200).send({
                data: tracksOnCollection as Track[], 
                message: "Succesffuly get tracksOnCollection"});
    }
}
